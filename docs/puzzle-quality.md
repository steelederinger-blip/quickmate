# QuickMate Puzzle Quality Workflow

QuickMate Puzzle Pack v2 is the first production-content track. The current 25-puzzle pack remains development/test content and should only be used to exercise app behavior.

## Puzzle Pack v2 Target

Pack v2 should start with 50 candidate puzzles:

- 20 mate-in-1 puzzles
- 20 mate-in-2 puzzles
- 10 mate-in-3 puzzles

Do not promote candidates by count alone. The final approved pack should balance tactical themes, difficulty, and mode fit.

The current v2 trial batch contains 10 Rush-friendly candidates: 5 mate-in-1 and 5 mate-in-2 puzzles. It is a playability test before sourcing the full 50-candidate set.

## Required Metadata

Every production-track puzzle must include:

- `id`: stable unique id
- `fen`: starting position
- `solution`: exact forcing line in SAN
- `mateIn`: claimed mate depth
- `themes`: tactical themes as a non-empty string array
- `difficulty`: app-facing difficulty band
- `rating`: approximate puzzle rating
- `contentStatus`: workflow status
- `modeFit`: suitable modes, such as `rush`, `daily`, `ladder`, or `challenge`
- `source`: provenance for non-dev content
- `qualityNotes`: review notes, caveats, or verification evidence

The app still supports the legacy `theme` field during migration. New production-track content should use `themes`; compatibility aliases can remain until the app fully migrates.

## Content Statuses

- `dev`: synthetic or temporary content used for implementation and testing
- `candidate`: imported or authored puzzle awaiting production review
- `approved`: reviewed puzzle suitable for production play
- `rejected`: puzzle that failed review and should not be surfaced

## Production Review Requirements

Before a puzzle can move from `candidate` to `approved`, verify:

- no faster mate than claimed
- realistic forcing line
- varied themes across the pack
- no repetitive queen/rook-only pattern
- suitable mode fit: rush, daily, ladder, or challenge

## Validation Warnings

The puzzle validator should warn, without blocking development builds, when it detects:

- non-dev puzzles missing `source`
- puzzles missing `modeFit`
- puzzles missing `themes`
- repeated theme imbalance across the pack
- too many puzzles with the same `mateIn` and theme pattern

Warnings are content-quality signals. Hard failures remain reserved for structural errors such as duplicate ids, invalid FEN/solution moves, and final positions that are not checkmate.
