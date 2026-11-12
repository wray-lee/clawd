<div align="center">

<img src=".claude-plugin/icon.png" width="112" alt="Clawd">

# clawd

**让 Claude Code 的吉祥物 Clawd 住在输入框上方，把 Claude 正在做的事演出来。**

[![CI](https://github.com/wray-lee/clawd/actions/workflows/ci.yml/badge.svg)](https://github.com/wray-lee/clawd/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/wray-lee/clawd)](https://github.com/wray-lee/clawd/releases)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-2.1.319%2B-D97757)](https://claude.com/claude-code)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[English](README.md) | 简体中文 | [日本語](README.ja.md)

<img src="docs/assets/demo.gif" alt="Clawd 跑命令，四个子代理出现四只小 Clawd，各自完成后依次离开" width="100%">

</div>

## 特性

- **把工作演出来**：Claude 思考时来回走，跑命令时打字，读文件时眼睛左右扫，改代码时挥锤子。
- **每个子代理一只小 Clawd**：每个运行中的子代理（包括 workflow 里的）都有一只自己颜色的小 Clawd。子代理再开的子代理更小。代理结束，小 Clawd 就离开。
- **会回应你**：你在输入框打字时它跟着打，头顶举着你刚按的键；点它一下，它按当前状态做出反应。
- **有情绪**：一轮回答完成会庆祝，工具出错会吓一跳，安静两分钟后睡着。
- **适配任何主题**：Clawd 用欢迎界面同款主题色，小 Clawd 也只用主题色。所有字符都是单列宽，CJK 终端不会错位。

## 安装

在 Claude Code 终端会话的输入框里：

```
/plugin install clawd --marketplace wray-lee/clawd
```

按 `y` 添加 marketplace，再选作用域（user 作用域在每个会话加载）。也可以在 shell 里：

```sh
claude plugin install clawd --marketplace wray-lee/clawd
```

装好后重启 Claude Code。`/clawd` 隐藏或显示横栏。

## Clawd 会做什么

| 时机 | Clawd |
| --- | --- |
| Claude 思考时 | 来回走 |
| 运行 shell 命令时 | 打字，头顶 `>_` |
| 读文件或搜索时 | 眼睛左右扫，头顶 `...` |
| 编辑文件时 | 挥锤，冒火花 |
| 一轮回答完成时 | 笑眼、蹦跳、撒星星 |
| 工具出错时 | `!` 加抖一下 |
| 空闲时 | 眨眼、张望、蹦一下 |
| 空闲约 2 分钟后 | 睡觉冒 `z Z`，你一打字就醒 |
| 你在输入框打字时 | 跟着打字，举着你刚按的键 |

### 子代理小 Clawd

<img src="docs/assets/helpers.png" alt="Clawd 旁边四只不同颜色的小 Clawd，以及一只代表嵌套子代理的更小的" width="100%">

- 每个子代理一只 5 列宽的小 Clawd；子代理开出的子代理是 3 列宽的更小一只，紧跟在它的父代理后面。
- 颜色从主题色色库（`hooks/palette.ts`）里随机挑；色库用完之前，同屏的小 Clawd 不会撞色。
- 小 Clawd 排在 Clawd 空间更大的那一侧；横栏放不下时，剩下的显示为 `+N`。
- 引擎报告代理已完成、失败或被终止时，小 Clawd 离开；还在等后台任务的子代理会继续留着。

### 点击 Clawd

| Clawd 正在 | 点一下 |
| --- | --- |
| 空闲 | 笑眼咯咯笑，冒星星 |
| 睡觉 | 被叫醒，头顶 `!` |
| 走路 | 原地转身，晕乎乎 |
| 跑命令 | 挥手赶你，`!?` |
| 看书 | 抬头看你，`o.o` |
| 敲代码 | 锤子砸到自己头上 |
| 庆祝 | 和你击掌 |

> [!NOTE]
> 点击需要全屏布局（终端才会上报鼠标）。在 tmux 里请设置 `CLAUDE_CODE_NO_FLICKER=1`。

<img src="docs/assets/celebrate.png" alt="一轮回答完成，Clawd 笑眼庆祝、撒星星" width="100%">

## 要求

- Claude Code 2.1.319 或更新版本，在终端里使用。横栏只在终端绘制，桌面版和手机 App 不显示。
- 输入框上方需要 4 行空间，不够时 Clawd 自动隐藏。

## 常见问题

<details>
<summary>Clawd 能做成对话记录后面的真背景吗？</summary>

不能。终端里的 mod 只能画在自己的横栏里，超出横栏的内容会被裁掉。横栏旁边的 `[-]` 是引擎画的，插件去不掉。
</details>

<details>
<summary>装了新版本但没变化？</summary>

重启 Claude Code。已安装的插件在启动时加载，`/reload-plugins` 不会换成新版本。
</details>

<details>
<summary>怎么让 Clawd 别动了？</summary>

运行 `/clawd`。隐藏后什么都不画，也不再重绘。
</details>

## 开发

```sh
git clone https://github.com/wray-lee/clawd
cd clawd
claude --plugin-dir .      # 用本地代码启动 Claude Code
claude plugin validate .
claude plugin test .
```

目录结构和新增动作的方法见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 类似项目

- [zhanbodev/clawd-buddy](https://github.com/zhanbodev/clawd-buddy)
- [CodeChrisB/MyClawd](https://github.com/CodeChrisB/MyClawd)

## 许可证

[MIT](LICENSE)。Clawd 是 Anthropic 的吉祥物，本项目是粉丝作品，不是 Anthropic 官方产品。
