# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

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
