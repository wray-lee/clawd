# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [1.1.0] - 2026-11-26

### Changed

- The key Clawd or Claude-chan holds up as you type can be any character:
  Chinese, Japanese, Korean, accented letters and emoji (skin tones, ZWJ
  sequences and flags included), each taking the columns it needs. Only a
  space, a control or a lone accent still shows as `~`.

## [1.0.0] - 2026-11-26

### Added

- An easter egg: seven quick clicks on Clawd, or `/clawd chan`, turn it in a
  puff of smoke into Claude-chan, a chibi pixel-art girl with her own pose for
  every action, her own idle fidgets, and a laptop that shows the shell prompt
  or the key you just typed. Do it again to bring Clawd back; the choice is
  kept across sessions.
- She is drawn by hand in two sizes, 16 rows and 12, by `scripts/chan.py`;
  the band shows the bigger one that fits, and with fewer than 12 rows free
  Clawd stands in and says so.
- Beside her, a subagent's helper is a whole Clawd, a subagent's own one a
  mini, and a workflow's still wears the hat.

### Changed

- Her colors are xterm-256 colors, set so that a 256-color terminal (tmux)
  shows exactly them.
- `scripts/paint.ts` draws a cell's own colors and background, for her.

## [0.6.0] - 2026-11-12

### Added

- New actions: a download bar for a web fetch, ticked boxes for the task
  list, a blueprint drawn in plan mode, and a squeeze while the conversation
  compacts.
- New moods: Clawd says hi when a session starts, shrugs when you interrupt
  a turn, and looks sad when a turn ends in an error or a refusal.
- Idle, Clawd plays one of 14 fidgets at random every 8 seconds: it hops,
  waves, stretches, looks around, dances, hums, yawns, sneezes, shows a heart,
  juggles, crouches and jumps, stargazes, cheers, or nods off and snaps awake.
- `scripts/`: the tools that draw the README's images and measure redraws
  and CPU use.

### Changed

- Clawd naps after 10 quiet minutes, not 2.
- The README's images are drawn like a terminal draws: block rows meet with
  no seam and no overlap.
- Reading a file shows the open pages beside Clawd, one turning now and then.
- The actions GIF is a grid with every action playing at once.

## [0.5.0] - 2026-11-12

### Added

- Helpers for a workflow's agents wear a top hat in the purple of the
  `ultracode` label.
- New actions: a magnifying glass for search, a spell for a skill, and an
  antenna for an MCP call, each with its own click reaction.
- With more than 8 full or small helpers, the rest are counted under the
  `[-]` in two narrow columns, subagents and a workflow's agents apart: `+N`
  with a pixel in each one's color below. Single-pixel helpers don't count
  toward the 8. Helpers keep clear of Clawd's effects.

### Changed

- The band is drawn in a region of its own, so pressing on Clawd never selects
  or inverts its text.
- A finished turn rains confetti, so it no longer looks like a skill's sparkles.
- Helpers pick from 12 xterm-256 colors, and sparkles, `z`'s, signals and
  smoke have their own colors.
- Each tool's action plays for at least 1.5 seconds.
- Editing shows a real hammer.
- Idle blinks and glances come less often.
- Tests moved to `tests/`.
- A tick redraws only when the frame changed. Idle CPU use of the whole
  Claude Code process went from about 12% to 6% in our measurement.

### Fixed

- The helper palette had theme keys that draw the same blue in 256-color
  terminals (`suggestion`, `remember`, `permission`).

## [0.4.1] - 2026-11-12

### Changed

- Subagents three levels down and deeper show as a single pixel.

## [0.4.0] - 2026-11-12

### Added

- A small helper Clawd for each running subagent, workflow agents included.
  A subagent's own subagents get a smaller one, right after its parent. Each
  helper leaves when the engine reports its agent as completed, failed or killed.
- Helper colors come at random from a palette of theme colors
  (`hooks/palette.ts`), all different on screen until the palette runs out.

### Changed

- README: demo GIF, screenshots, feature list and FAQ, plus a Japanese version.

## [0.3.0] - 2026-11-12

### Added

- Click Clawd: it reacts to fit what it is doing. Idle, it giggles; asleep, it
  wakes; walking, it spins around; at a command, it waves you off; reading, it
  looks up at you; editing, the hammer bonks its own head; celebrating, a high five.
- Type in the prompt: Clawd types along and holds up the last key you typed.
  Typing also wakes it.

## [0.2.0] - 2026-11-12

### Added

- Actions follow what Claude is doing: types during shell commands, scans
  with its eyes while reading or searching, hammers with sparks while editing.
- Reactions: celebrates when a turn finishes, startles and shakes when a tool
  fails, wakes with a "!" when a prompt arrives while it sleeps.
- Idle glances left and right; z's float to whichever side has room.
- One file per action under `hooks/actions/`.

## [0.1.1] - 2026-11-12

### Changed

- Clawd starts at the right edge of the band, above the right end of the prompt.

## [0.1.0] - 2026-11-12

### Added

- Clawd band above the prompt in the terminal, 4 rows, in the welcome screen's theme orange.
- Walking animation while Claude works, idle blink and hop, nap with `z` after about 2 minutes idle.
- `/clawd` command to hide or show the band.
