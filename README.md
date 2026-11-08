# NEON FOUR2 · 霓虹四二

> Use **exactly four `2`s** to build the number on screen. Single file, zero dependencies, zero network calls.
> 用**恰好四个 `2`** 造出屏幕上的目标数。单文件、零依赖、零网络请求。

## 玩法 / How to play

屏幕给出一个目标数（0 / 1 / 2 / 3 / 4 / 5 / 6 / 7 / 8 / 9 / 10 / 12 / 14 / 16 / 18 / 111），
在输入框里写一个表达式，使它**恰好用到四个 `2`**，且计算结果等于目标。按 Enter 或点「检验」。
「提示」会显示一个可行解；「换一题」随机换目标（不会连续出同一题）。连胜、最佳连胜、已解数保存在浏览器本地。

可用字符：

```
2   +   -   *   /   ^   !   (   )   .   空格
```

- 数字可拼接：`22`、`222`、`2.2`、`.2`
- `^` 幂，右结合：`2^2^2 = 16`
- `!` 阶乘（后缀，仅接受 0–20 的整数）：`(2+2/2)! = 6`
- 一元负号优先级低于幂：`-2^2 = -4`
- 除零、多余符号、非法字符、非有限结果都会被明确拒绝

示例：`2+2+2+2 = 8` ／ `22/2-2 = 9` ／ `2^2+2-2 = 4` ／ `2/.2/2+2 = 7` ／ `222/2 = 111`

表达式求值由内置递归下降解析器完成，**不使用 `eval`**；所有回显通过 `textContent` 注入，无 XSS 面。

## 运行 / Run

直接用浏览器打开 `index.html` 即可；或起一个本地静态服务：

```
python -m http.server 8765
# 打开 http://127.0.0.1:8765/
```

## 检验 / Verification

```
node selftest.mjs     # 确定性自测：解表自洽、代数优先级、拒绝用例、输入输出样例；退出码 0 = 通过
```

自测脚本从 `index.html` 中截取 `CORE` 代码块，直接驱动产品里真正的解析器（无 DOM、无 `eval`），
因此测的就是线上逻辑本身。网页侧另经 HTML 标签闭合检查、无外部资源引用检查、本地 HTTP 200 探活。

## 灵感来源 / Inspiration

A Hacker News front-page item, **"Making any integer with four 2s" (2025), 54 pts**:
<https://eli.thegreenplace.net/2025/making-any-integer-with-four-2s/>

Only the mathematical puzzle *idea* is borrowed. The parser, puzzle set, visual design and all text here
are original; no code or prose was copied, so no third-party LICENSE is involved.
只借鉴谜题概念，解析器、题库、界面与文案均为原创，未复制任何第三方代码或文本。

## 归属 / Attribution

Part of the `auto-lab-d` experiment. Built by **Atlas**.
本项目为 `auto-lab-d` 系列实验产物，署名 Atlas；娱乐用途。
