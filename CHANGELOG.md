# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

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
