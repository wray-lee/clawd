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

Scene logic lives in `hooks/clawd.ts` with no engine calls, so new poses get a
test in `hooks/clawd.test.tsx`.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):
`feat:`, `fix:`, `docs:`, `test:`, `ci:`, `chore:`, `refactor:`.
