# QuickMate

QuickMate is a mobile-first React/Vite chess puzzle trainer focused on fast mate-solving. It includes Daily QuickMate, a grouped Puzzle Ladder, and a timed Rush Mode using a local Puzzle Pack v1.

Current version: **QuickMate MVP v0.1**

## Local Development

```bash
npm run dev
```

## Puzzle Validation

```bash
npm run validate:puzzles
```

This checks every puzzle solution with `chess.js` and confirms each final position is checkmate.

## Build

```bash
npm run build
```

## Deployment Preflight

```bash
npm run verify
```

This validates the puzzle pack and creates a fresh production build in `dist`.

## Netlify Settings

- Build command: `npm run build`
- Publish directory: `dist`
- App path: `/`
- Config file: `netlify.toml`

## Puzzle Pack

- Puzzle Pack v1
- 25 local mate puzzles
- Data source: `src/puzzles.js`
