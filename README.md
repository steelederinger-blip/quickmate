# QuickMate

QuickMate is a mobile-first React/Vite chess puzzle trainer focused on fast mate-solving. It includes Daily QuickMate, a grouped Puzzle Ladder, and a timed Rush Mode using a local Puzzle Pack v1.

The current 25-puzzle pack is development/test content. It exists to exercise the app flow, scoring, validation, and mode behavior, but it is not production-quality puzzle content.

Current version: **QuickMate MVP v0.1**

## Local Development

```bash
npm run dev
```

## Puzzle Validation

```bash
npm run validate:puzzles
```

This checks every puzzle solution with `chess.js`, confirms each final position is checkmate, and reports puzzle `contentStatus` counts.

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
- Current content status: `dev`
- Current content purpose: development and test coverage for app behavior

The pack is generated from a small set of synthetic queen, rook, and knight patterns. It should not be treated as a curated production puzzle set.

## Production Puzzle Quality Gate

Before a puzzle can move out of `contentStatus: "dev"`, verify:

- no faster mate than claimed
- realistic forcing line
- varied themes across the pack
- no repetitive queen/rook-only pattern
- suitable mode fit: rush, daily, ladder, or challenge
