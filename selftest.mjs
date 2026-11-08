// NEON FOUR2 · deterministic self-test
// Extracts the CORE block from index.html and drives the real parser (no DOM, no eval).
// Run: node selftest.mjs    → exit 0 = all pass, exit 1 = failure
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const parts = html.split('// --- CORE START ---');
if (parts.length < 2) { console.error('FAIL: CORE START marker missing'); process.exit(1); }
const core = parts[1].split('// --- CORE END ---')[0];
if (!core) { console.error('FAIL: CORE END marker missing'); process.exit(1); }

const api = new Function(core + '\nreturn { evaluate, SOLUTIONS, TARGETS, tokenize, parseValue };')();
const { evaluate, SOLUTIONS, TARGETS, parseValue, tokenize } = api;

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? '  -> ' + detail : '')); }
}
function eq(name, actual, expected) {
  ok(name, Math.abs(actual - expected) < 1e-9, 'got ' + actual + ', want ' + expected);
}

console.log('--- 1. solution table self-consistency (each must use exactly four 2s and hit its target) ---');
for (const t of TARGETS) {
  const expr = SOLUTIONS[t];
  const twos = (expr.match(/2/g) || []).length;
  const r = evaluate(expr, t);
  ok(`target ${String(t).padStart(3)} : ${expr.padEnd(14)} twos=4 value=${t}`,
     twos === 4 && r.ok && Math.abs(r.value - t) < 1e-9,
     JSON.stringify(r));
}

console.log('--- 2. parser algebra / precedence ---');
eq('2+2+2+2 = 8', parseValue(tokenize('2+2+2+2')), 8);
eq('2+2*2-2 = 4', parseValue(tokenize('2+2*2-2')), 4);
eq('22/2-2 = 9', parseValue(tokenize('22/2-2')), 9);
eq('2^2^2 = 16 (right assoc)', parseValue(tokenize('2^2^2')), 16);
eq('-2^2 = -4 (unary binds looser than power)', parseValue(tokenize('-2^2')), -4);
eq('(2+2/2)! = 6', parseValue(tokenize('(2+2/2)!')), 6);
eq('2/.2/2+2 = 7', parseValue(tokenize('2/.2/2+2')), 7);
eq('222/2 = 111', parseValue(tokenize('222/2')), 111);

console.log('--- 3. rejection cases ---');
ok('too few 2s rejected', !evaluate('2+2', 4).ok && /四个 2/.test(evaluate('2+2', 4).msg));
ok('too many 2s rejected', !evaluate('2+2+2+2+2', 10).ok);
ok('illegal character rejected', !evaluate('2+2+2+2x', 8).ok && /不允许的字符/.test(evaluate('2+2+2+2x', 8).msg));
ok('incomplete expression rejected', !evaluate('2+2+2+', 6).ok);
ok('unbalanced parens rejected', !evaluate('(2+2+2+2', 8).ok && /右括号/.test(evaluate('(2+2+2+2', 8).msg));
ok('division by zero rejected', !evaluate('2/(2-2)+2', 2).ok && /不能除以 0/.test(evaluate('2/(2-2)+2', 2).msg));
ok('wrong value rejected with computed value', !evaluate('2+2+2+2', 9).ok && /算出来是 8/.test(evaluate('2+2+2+2', 9).msg));
ok('factorial argument > 20 rejected', (() => {
  try { parseValue(tokenize('(22+22)!')); return false; }
  catch (e) { return /阶乘/.test(e.message); }
})());

console.log('--- 4. input/output samples ---');
for (const s of ['2+2+2+2', '22/2-2', '2^2^2', '2/.2/2+2', '222/2']) {
  console.log(`  IN  ${s.padEnd(12)} OUT ${parseValue(tokenize(s))}`);
}
console.log('  IN  evaluate("2+2+2+2", 9)  OUT ' + JSON.stringify(evaluate('2+2+2+2', 9)));
console.log('  IN  evaluate("2+2", 4)       OUT ' + JSON.stringify(evaluate('2+2', 4)));

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
