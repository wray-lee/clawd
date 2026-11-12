# clawd

[English](README.md) | [简体中文](README.zh-CN.md)

一个 Claude Code mod：把欢迎界面上那只橙色的 Clawd 放到输入框上方的一条小横栏里。
Claude 干活时它来回走，空闲时眨眼、蹦一下，安静大约两分钟后睡着并冒出 `z`。

```
 ▐▛███▜▌          ▐█████▌ z Z
▝▜█████▛▘   ->   ▝▜█████▛▘
  ▘▘ ▝▝            ▘▘ ▝▝
  干活中            睡着了
```

## 安装

在 Claude Code 终端会话的输入框里：

```
/plugin install clawd --marketplace wray-lee/clawd
```

按 `y` 添加 marketplace，再选作用域（user 作用域会在每个会话里加载）。也可以在 shell 里：

```sh
claude plugin install clawd --marketplace wray-lee/clawd
```

## 使用

| 内容 | 方式 |
| --- | --- |
| 隐藏或显示 Clawd | `/clawd` |
| 来回走 | Claude 思考时 |
| 打字，头顶 `>_` | 运行 shell 命令时 |
| 眼睛左右扫，头顶 `...` | 读文件或搜索时 |
| 挥锤，冒火花 | 编辑文件时 |
| 笑眼、蹦跳、撒星星 | 一轮回答完成时 |
| `!` 加抖一下 | 工具出错时 |
| 眨眼、左右张望、蹦一下 | 空闲时 |
| 睡觉冒 `z Z` | 空闲约 2 分钟后，下次提问时醒来 |

## 要求

- Claude Code 2.1.319 或更新版本，在终端里使用。横栏只在终端绘制，桌面版和手机 App 不显示。
- Clawd 使用和欢迎界面相同的主题色，在任何终端和主题下都一致。
- 输入框上方需要 4 行空间，不够时 Clawd 自动隐藏。

## 开发

```sh
git clone https://github.com/wray-lee/clawd
cd clawd
claude --plugin-dir .
claude plugin validate .
claude plugin test .
```

见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可证

[MIT](LICENSE)。Clawd 是 Anthropic 的吉祥物，本项目是粉丝作品，不是 Anthropic 官方产品。
