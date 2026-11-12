<div align="center">

<img src=".claude-plugin/icon.png" width="112" alt="Clawd">

# clawd

**Clawd, the Claude Code mascot, lives above your prompt and acts out what Claude is doing.**

[![CI](https://github.com/wray-lee/clawd/actions/workflows/ci.yml/badge.svg)](https://github.com/wray-lee/clawd/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/wray-lee/clawd)](https://github.com/wray-lee/clawd/releases)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-2.1.319%2B-D97757)](https://claude.com/claude-code)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

English | [简体中文](README.zh-CN.md) | [日本語](README.ja.md)

<img src="docs/assets/demo.gif" alt="Clawd runs a command, four helper Clawds appear for four subagents, and they leave one by one as each finishes" width="100%">

</div>

## Features

- **Acts out the work.** Clawd walks while Claude thinks, types at a shell
  command, holds up the pages it reads, holds up a magnifying glass to
  search, watches a download bar fill for a web page, hammers while editing,
  casts a spell for a skill, raises an antenna for an MCP call, ticks boxes
  for the task list, draws a blueprint in plan mode, and gets squeezed while
  the conversation compacts.
- **A helper per subagent.** Each running subagent, workflow agents included,
  gets a small Clawd in its own color. A subagent's own subagents are smaller
  still. A workflow's agents wear a purple top hat. Each helper leaves when
  its agent finishes.
- **Reacts to you.** Clawd types along with you in the prompt and holds up the
  last key. Click it and it reacts to what it is doing. A click never selects
  Clawd's text, so it is never highlighted or copied.
- **Moods.** Clawd says hi when a session starts, celebrates a finished turn,
  shrugs when you interrupt, looks sad at an error, startles when a tool
  fails, fidgets while it waits, and naps after ten quiet minutes.
- **Colorful.** Clawd keeps the welcome screen's own theme orange. Helpers
  come in 12 colors, and confetti, sparkles, `z`'s, signals and smoke each have their
  own. Every glyph is one column wide, so CJK terminals stay aligned.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install clawd --marketplace wray-lee/clawd
```

Answer `y` to add the marketplace, then pick a scope. User scope loads Clawd in
every session. From a shell:

```sh
claude plugin install clawd --marketplace wray-lee/clawd
```

Restart Claude Code to load it. `/clawd` hides or shows the band.

## What Clawd does

<img src="docs/assets/actions.gif" alt="A grid of all of Clawd's actions, each playing at once" width="100%">

| When | Clawd |
| --- | --- |
| Claude is thinking | walks back and forth |
| a shell command runs | types, `>_` above |
| Claude reads a file | holds the open pages beside it, turning one now and then |
| Claude fetches a web page | a download bar `[==...]` fills above its head |
| Claude searches (Grep, Glob, web search) | holds a magnifying glass out to each side, `?` |
| Claude edits files | hammers, sparks fly |
| Claude uses a skill | arms up, two comets of sparks circle its head |
| Claude calls an MCP tool | an antenna on its head sends out `( ( \| ) )` |
| Claude writes the task list | ticks `[x]` boxes above its head |
| Claude enters or leaves plan mode | holds up a teal blueprint and draws a route on it |
| the conversation compacts | `>>` and `<<` squeeze it until it's done |
| a session starts | waves with happy eyes, `hi!` |
| a turn finishes | happy eyes, hops, confetti falls |
| a tool fails | `!` and a shake |
| you interrupt the turn | shrugs, `-.-` |
| the turn ends in an error or a refusal | eyes cast down, a tear rolls |
| nothing happens | blinks, and every 8 seconds plays one of 14 fidgets at random: hops, waves, stretches, looks around, dances, hums, yawns, sneezes, shows a heart `<3`, juggles, crouches and jumps, stargazes, cheers, or nods off and snaps awake |
| 10 quiet minutes pass | sleeps with `z Z`, wakes when you type |
| you type in the prompt | types along, holds up your last key |

Each tool's action plays for at least 1.5 seconds, so a quick search or skill
is seen and not just a flicker.

<img src="docs/assets/actions.png" alt="One frame of each action, labeled" width="100%">

Clawd shows nothing while a dialog (a permission prompt or a question) holds
the prompt: the engine hides the band then.

### Helpers for subagents

<img src="docs/assets/workflow.gif" alt="A plain subagent's helper beside three workflow agents' helpers in purple top hats, hopping, then leaving as each agent finishes" width="100%">

<img src="docs/assets/helpers.png" alt="Four helper Clawds in different colors beside Clawd, and a smaller one for a nested subagent" width="100%">

- Each subagent gets a 5-column helper, and a subagent's own subagent gets a
  3-column one. Three levels down and deeper, a helper is a single pixel.
  Each nested helper stands right after its parent.
- Each helper's color is picked at random from a palette of 12 colors
  (`hooks/palette.ts`). They are xterm-256 colors, so they stay distinct in a
  256-color terminal too. No two helpers on screen share a color until all 12
  are taken.
- Agents started by a workflow wear a top hat in the purple of the
  `ultracode` label, so you can tell them from plain subagents. No helper's
  body is ever that purple.
- Helpers line up on the side of Clawd that has room. At most 8 full or
  small helpers are drawn; single-pixel ones don't count toward that and show
  as long as there is room. The rest are counted under the `[-]` in two
  narrow columns, plain subagents and then a workflow's agents: `+N` (in hat
  purple for the workflow's) with a pixel in each one's color below it.
  Helpers keep clear of Clawd's effects, so a hammer or confetti is never
  covered.
- A helper leaves when the engine reports its agent as completed, failed or
  killed. A subagent that is still waiting on background work keeps its helper.

<img src="docs/assets/crowd.png" alt="Eight helper Clawds beside Clawd; under the [-], a +4 column with colored pixels for subagents and a purple +2 column for workflow agents" width="100%">

### Click Clawd

| Clawd is | A click |
| --- | --- |
| idle | giggles with happy eyes and sparkles |
| asleep | wakes up with a `!` |
| walking | spins around, dizzy |
| running a command or compacting | waves you off, `!?` |
| reading, fetching, on the task list or a plan | looks up at you, `o.o` |
| editing | bonks its own head with the hammer |
| celebrating | gives a high five |
| searching | found it! Glass held high, `!` |
| using a skill | the spell goes poof in a puff of smoke |
| on an MCP call | the line crackles with static |

> [!NOTE]
> Clicks need the fullscreen layout, where the terminal reports the mouse. In
> tmux, set `CLAUDE_CODE_NO_FLICKER=1`. The band is drawn in a region of its
> own, so pressing on it never starts a text selection.

<img src="docs/assets/celebrate.png" alt="Clawd hopping with happy eyes after a finished turn" width="100%">

## Requirements

- Claude Code 2.1.319 or newer, in a terminal. Only the terminal draws the
  band; the desktop and mobile apps do not show it.
- 4 free rows above the prompt. With less room, Clawd stays hidden.

## FAQ

<details>
<summary>Can Clawd be a real background behind the transcript?</summary>

No. Terminal mods draw in bands of their own, and the band clips anything
positioned outside it. The `[-]` beside the band is the engine's, so a plugin
cannot remove it.
</details>

<details>
<summary>I installed an update and nothing changed.</summary>

Restart Claude Code. An installed plugin loads at startup, and
`/reload-plugins` does not pick up a new version.
</details>

<details>
<summary>How do I make Clawd stop moving?</summary>

Run `/clawd`. A hidden Clawd draws nothing and does not redraw.
</details>

## Develop

```sh
git clone https://github.com/wray-lee/clawd
cd clawd
claude --plugin-dir .      # run Claude Code with your checkout
claude plugin validate .
claude plugin test .
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the layout and how to add an action.

## Similar projects

- [zhanbodev/clawd-buddy](https://github.com/zhanbodev/clawd-buddy)
- [CodeChrisB/MyClawd](https://github.com/CodeChrisB/MyClawd)

## License

[MIT](LICENSE). Clawd is Anthropic's mascot. This is a fan project, not an
Anthropic product.
