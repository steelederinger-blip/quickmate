# QuickMate

QuickMate is a mobile-first React/Vite chess puzzle trainer focused on fast mate-solving. It includes Rush Mode, Daily Rush, Daily Warmup, Ladder World, Collection, and a grouped Classic Ladder using a local puzzle pack.

The original 25-puzzle pack is development/test content. It exists to exercise the app flow, scoring, validation, and mode behavior, but it is not production-quality puzzle content.

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

- Puzzle Pack v1 dev set plus v2 trial candidates
- 100 local mate puzzles
- 25 development/test puzzles
- 75 v2 candidate puzzles
- Data source: `src/puzzles.js`
- Current content statuses: `dev`, `candidate`
- Current content purpose: development and test coverage for app behavior

The dev pack is generated from a small set of synthetic queen, rook, and knight patterns. The v2 candidates include the v2.2 Rush candidate pack: 25 mate-in-1, 30 mate-in-2, 15 mate-in-3, and 5 mate-in-4 candidates for testing better Blitz, Classic, and Survival content. They are not approved production content.

Rush Mode and Daily Rush only select production-track puzzles: `candidate` or `approved`. They exclude `dev` and `rejected` puzzles, and repeat production-track puzzles during long runs instead of falling back to dev content. Rush content should scale from quick mates to deeper forced-mate sequences as the player advances. Blitz focuses on mate-in-1 to mate-in-3 candidates; Classic and Survival can include mate-in-4 candidates as the production-track pool expands. Daily Warmup is one quick puzzle to warm up before Rush; it prefers production-track puzzles, then falls back to dev content only if no candidate or approved puzzles exist. Ladder still shows dev puzzles separately for development testing.

## Production Puzzle Quality Gate

See `docs/puzzle-quality.md` for the Puzzle Pack v2 target, metadata requirements, content statuses, and validation warning policy.

Before a puzzle can move out of `contentStatus: "dev"`, verify:

- no faster mate than claimed
- realistic forcing line
- varied themes across the pack
- no repetitive queen/rook-only pattern
- suitable mode fit: rush, daily, ladder, or challenge

## Collection System

See `docs/collection-system-plan.md` for the planned cosmetic collection system, including piece sets, board themes, badges, Rush chests, localStorage-only implementation phases, and no-pay-to-win guardrails. The current local implementation awards cosmetic chests from Rush and Pawn Village node clears, while Pawn Village boss rewards can unlock a specific collection piece or a fallback chest. Collection rewards must not grant score boosts, extra lives, timer bonuses, or other gameplay advantages.
