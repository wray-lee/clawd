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
- `hooks/clawd.ts`: the scene (position, which action plays) and drawing
- `hooks/register.tsx`: the engine hooks

## Add an action

1. Write `hooks/actions/<name>.ts` exporting an `Action`. Use only one-column
   glyphs (ASCII or quadrant blocks), so CJK terminals stay aligned.
2. List it in `hooks/actions/index.ts`.
3. Pick it in `actionFor` in `hooks/clawd.ts`.

The tests check every listed action stays inside the band at any width.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):
`feat:`, `fix:`, `docs:`, `test:`, `ci:`, `chore:`, `refactor:`.
