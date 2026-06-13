# QuickMate Rush Tuning Log

## Current production version

- Production branch: `main`
- Current deployed commit: `dfb2e1781d4400b12e45f8df4d28cd0f7073a656`
- Current production content track: Rush Candidate Pack v2.2
- Current production-track puzzle pool: 75 candidate puzzles
- Live site: https://quickmate.netlify.app

## Rush mode notes

- Blitz Rush is the quick-pressure mode for fast mate recognition.
- Classic Rush is the balanced timed mode and can carry deeper candidate content than Blitz.
- Survival Rush is the long-run mode intended to scale from quick mates toward deeper forced lines.
- Rush should use only `candidate` and `approved` puzzles.
- Rush should not fall back to `dev` or `rejected` puzzles.

## Puzzle issues

Record puzzle IDs from Review Missed or active play when a puzzle feels:

- bad
- confusing
- broken
- too easy
- too hard
- fake
- repetitive
- misfit for the selected Rush mode

Use the in-app Copy Puzzle Feedback button as the source of each report.

## ModeFit changes

- Mate-in-1 through mate-in-3 candidates can be considered for Blitz, Classic, Survival, and Ladder when they feel fair under time pressure.
- Mate-in-4 candidates should default to Classic, Survival, and Ladder unless playtesting proves they are Blitz-suitable.
- Puzzles that feel good tactically but bad under time pressure should keep Ladder fit and lose Rush fit.
- Puzzles that are legal but artificial should remain `candidate` until reviewed or be moved to `rejected`.

## Timer/lives tuning

- Blitz currently emphasizes short runs with tighter time and fewer lives.
- Classic currently provides a balanced timer/lives profile.
- Survival currently uses lives as the main pressure and should introduce deeper mate content gradually.
- Track whether the first wrong move retry feels helpful or too forgiving.
- Track whether the second wrong move reveal delay feels too slow, too fast, or right.

## Scoring/rank tuning

- Fast, perfect solves should remain the clearest way to build score.
- Combo and multiplier thresholds should reward consistency without making one mistake end the run's value.
- Rank thresholds should feel reachable for early players and still leave room for high-skill runs.
- Review whether mate-in-3 and mate-in-4 puzzles need higher base value once the content quality improves.

## Decisions made

- Rush uses production-track puzzles only: `candidate` or `approved`.
- Dev puzzles are excluded from Rush.
- Candidate/approved puzzles may repeat during a long Rush run instead of falling back to dev content.
- Rush v2 includes Blitz, Classic, and Survival modes.
- Rush lives are lost on skips and second wrong legal moves, not on the first wrong legal move.
- Missed and skipped Rush puzzles reveal the correct line and appear in Review Missed.
- Lightweight puzzle feedback is clipboard-only for now; no database, accounts, or external submission flow.

## Playtesting checklist

- [ ] Blitz: 5 runs
- [ ] Classic: 3 runs
- [ ] Survival: 2 runs
- [ ] Record puzzles that feel bad, too easy, too hard, fake, repetitive, or misfit for the mode.
