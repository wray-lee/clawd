# Contributing

## Develop

```sh
claude --plugin-dir .
```

The session reloads the mod when you save a file.

## Check before a pull request

```sh
claude plugin validate .
claude plugin test .
```

## Layout

- `hooks/sprites.ts`: Clawd's parts (heads, arms, legs) and the `Action` type
- `hooks/actions/<name>.ts`: one action each, a function from the tick to a pose
- `hooks/actions/index.ts`: the list of actions
- `hooks/clawd.ts`: the scene (position, which action plays) and drawing, helpers included
- `hooks/palette.ts`: the theme colors helper Clawds pick from
- `hooks/register.tsx`: the engine hooks

## Add an action

1. Write `hooks/actions/<name>.ts` exporting an `Action`. Use only one-column
   glyphs (ASCII or quadrant blocks), so CJK terminals stay aligned.
2. List it in `hooks/actions/index.ts`.
3. Pick it in `hooks/clawd.ts`: in `actionFor` for a state, or in `CLICK` for
   the reaction a click plays during an action (with its length in `EVENT_TICKS`).

The tests check every listed action stays inside the band at any width.

## Screenshots

`docs/assets/` holds the README images, taken from a real session in tmux
(`tmux capture-pane -e`) and drawn to PNG and GIF with ImageMagick. Retake
them when the look of Clawd changes.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):
`feat:`, `fix:`, `docs:`, `test:`, `ci:`, `chore:`, `refactor:`.
