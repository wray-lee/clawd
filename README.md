# clawd

[English](README.md) | [简体中文](README.zh-CN.md)

[![CI](https://github.com/wray-lee/clawd/actions/workflows/ci.yml/badge.svg)](https://github.com/wray-lee/clawd/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A Claude Code mod that puts Clawd, the orange mascot from the welcome screen,
in a small band above the prompt. Clawd walks back and forth while Claude is
working, blinks and hops while it waits, and falls asleep after about two
minutes of quiet.

```
 ▐▛███▜▌          ▐█████▌ z Z
▝▜█████▛▘   ->   ▝▜█████▛▘
  ▘▘ ▝▝            ▘▘ ▝▝
 working           asleep
```

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install clawd --marketplace wray-lee/clawd
```

Answer `y` to add the marketplace, then pick a scope (user scope loads it in
every session). From a shell:

```sh
claude plugin install clawd --marketplace wray-lee/clawd
```

## Use

| What | How |
| --- | --- |
| Hide or show Clawd | `/clawd` |
| Walks | while a model turn is running |
| Blinks and hops | while idle |
| Sleeps | after about 2 minutes idle |

## Requirements

- Claude Code 2.1.319 or newer, in a terminal. The band is terminal only; the
  desktop and mobile apps do not draw it.
- Clawd is painted with the same theme color as the welcome screen, so it
  matches your theme in any terminal.
- The band needs 4 free rows above the prompt. With less room Clawd stays hidden.

## Develop

```sh
git clone https://github.com/wray-lee/clawd
cd clawd
claude --plugin-dir .
claude plugin validate .
claude plugin test .
```

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE). Clawd is Anthropic's mascot; this is a fan project, not an
Anthropic product.
