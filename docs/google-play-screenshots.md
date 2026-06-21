# QuickMate Google Play Screenshot and Feature Graphic Prep

Status: draft capture plan. Do not upload these assets to Google Play until the final signed release build and store declarations are ready.

## Existing Listing Plan Review

`docs/google-play-listing.md` already plans screenshots for:

- Home
- Rush
- Daily Rush
- Mate Challenge
- Ladder World
- Boss Battle
- Collection / Themes
- Achievements

This file turns that plan into a capture checklist and asset-prep guide.

## Google Play Screenshot Requirements

- Minimum required to publish: at least 2 screenshots across supported device types.
- Maximum per supported device type: up to 8 screenshots.
- Recommended phone launch set for QuickMate: 8 portrait phone screenshots.
- Recommended phone size: 1080x1920 PNG or JPEG, 9:16 portrait.
- Alternate game format: 1920x1080 PNG or JPEG, 16:9 landscape, if a landscape store set is later desired.
- Format: JPEG or 24-bit PNG, no alpha.
- Minimum dimension: 320 px.
- Maximum dimension: 3840 px.
- Aspect guard: the longest side should not be more than twice the shortest side.

## Capture Device Recommendation

Use a clean Android emulator or test device running the current Android debug/release-candidate build. Prefer a dedicated screenshot profile so local progress can be prepared without affecting normal testing.

Recommended setup:

- Device or emulator: 1080x1920 portrait viewport.
- Orientation: portrait.
- Theme: default QuickMate dark theme unless a specific board/theme screenshot requires otherwise.
- Network: normal online state for app load; do not show offline fallback in store screenshots.
- Status bar: clean, no notifications, full battery/Wi-Fi/cell icons if visible.
- Build: use the same app version intended for internal testing/review when possible.

Avoid:

- Browser chrome, emulator controls, debug overlays, console overlays, or Android navigation clutter.
- Screenshots from a browser that do not represent the Android app shell.
- Cropping that hides important controls, text, board squares, timers, or reward wording.
- Text overlays that claim rankings, awards, price, discounts, downloads, or "install/play now" calls to action.

## Screenshot Capture Checklist

### 1. Home

- Caption: Play fast chess tactics anywhere
- Screen to capture: main home/dashboard.
- Desired visible state: QuickMate brand, Rush Mode, Today's Daily Rush, Ladder World, Collection, and practice entry points.
- State preparation: fresh or lightly progressed profile is acceptable. Keep stats believable and not exaggerated.
- Alt text draft: QuickMate home screen with Rush, Daily Rush, Ladder World, Collection, and practice modes.

### 2. Rush

- Caption: Race the clock in Rush mode
- Screen to capture: active Classic Rush or Blitz Rush puzzle.
- Desired visible state: chess board, timer, lives, score/combo, puzzle title/tags, and move controls.
- State preparation: start a run and capture early, before mistakes or game-over state. A modest combo is fine if earned during capture.
- Alt text draft: QuickMate Rush mode showing a timed chess puzzle with lives, score, combo, and board.

### 3. Daily Rush

- Caption: Beat daily puzzles and build your streak
- Screen to capture: Daily Rush start screen or active Daily Rush puzzle.
- Desired visible state: daily mode identity, streak context, board or run summary, and today's challenge framing.
- State preparation: use a profile with a small earned streak if available; otherwise a clean daily state is acceptable.
- Alt text draft: QuickMate Daily Rush screen showing a daily chess puzzle challenge and streak progress.

### 4. Mate Challenge

- Caption: Practice mate challenges by difficulty
- Screen to capture: Mate Challenge selection or active challenge puzzle.
- Desired visible state: difficulty filters or active board with attacking moves left.
- State preparation: capture either the difficulty selector with All/Warmup/Standard/Advanced/Expert or an active puzzle with clear move-limit context.
- Alt text draft: QuickMate Mate Challenge screen with difficulty choices and a checkmate puzzle challenge.

### 5. Ladder World

- Caption: Climb the Ladder World campaign
- Screen to capture: Ladder World campaign map or world/node screen.
- Desired visible state: world name, progress nodes, unlock path, and campaign progression.
- State preparation: use a profile with early campaign progress so locked and unlocked states are both understandable.
- Alt text draft: QuickMate Ladder World campaign screen with themed progress nodes and world progression.

### 6. Boss Battle

- Caption: Face boss battles and unlock rewards
- Screen to capture: boss intro, boss battle screen, or boss result/reward screen.
- Desired visible state: boss identity, challenge framing, board/puzzle UI, and reward language if present.
- State preparation: ensure a boss battle is accessible before capture. Avoid wording or visuals that could imply paid loot or cash-value rewards.
- Alt text draft: QuickMate boss battle screen showing a chess tactics challenge and earned progression reward.

### 7. Collection / Themes

- Caption: Collect pieces, boards, badges, and achievements
- Screen to capture: Collection page, piece themes, board themes, or reward inventory.
- Desired visible state: cosmetic pieces, board themes, badges, chest count, or collection progress.
- State preparation: use a profile with several earned cosmetic/progression items unlocked. Keep chests clearly framed as earned in-game rewards with no cash value.
- Alt text draft: QuickMate collection screen showing earned pieces, board themes, badges, and cosmetic rewards.

### 8. Achievements

- Caption: Track streaks, clears, and mastery
- Screen to capture: Achievements list or achievement progress view.
- Desired visible state: several achievement rows/cards with clear locked, unlocked, and progress states.
- State preparation: use a profile with a few earned achievements and several remaining goals.
- Alt text draft: QuickMate achievements screen showing tactical milestones, streaks, clears, and progress.

## Caption Pool

Use these as concise screenshot captions or text-overlay candidates. If captions are placed directly on screenshots, keep them large, readable, and under about 20% of the image.

- Play fast chess tactics anywhere
- Beat daily puzzles and build your streak
- Race the clock in Rush mode
- Climb the Ladder World campaign
- Face boss battles and unlock rewards
- Practice mate challenges by difficulty
- Collect pieces, boards, badges, and achievements
- Track streaks, clears, and mastery

## Screenshot State Readiness

Prepare a dedicated screenshot profile with enough honest progress to show the app's breadth:

- Unlocked board themes.
- Unlocked piece themes.
- Stored or recently opened earned chests.
- Boss battle accessible.
- Mate Challenge attempts, clears, and streak stats.
- Daily Rush streak.
- Ladder World progress across early nodes/worlds.
- Collection progress showing some locked and unlocked items.
- Achievements showing mixed locked/unlocked/progress states.

Do not use impossible, misleading, or inflated stats. Store screenshots should show plausible real app states.

## Local Progress / Seeding Notes

Preferred method:

1. Use a throwaway emulator, test device, or browser profile.
2. Play through the app normally until the needed screenshot states are available.
3. Capture screenshots from that prepared profile.
4. Keep the profile separate from normal QA and release testing.

Optional localStorage note for local-only screenshot prep:

- QuickMate web progress is currently stored locally under `quickmate.stats.v1`.
- If a screenshot profile needs to be reused, export a known-good localStorage snapshot generated by normal gameplay, then import that snapshot only into a throwaway screenshot profile.
- Do not invent or hand-edit the localStorage schema unless a dedicated screenshot seeding tool is built and reviewed later.
- Do not add seeding code to the production app for store screenshots.
- Clear or isolate the screenshot profile after capture so it does not affect QA results.

## Feature Graphic Plan

Required output:

- Size: 1024x500.
- Format: JPEG or 24-bit PNG, no alpha.
- Use: Google Play feature graphic and possible preview-video cover.

Suggested text:

QuickMate
Fast chess tactics. Daily rush. Boss battles.

Shorter fallback text:

QuickMate
Fast chess tactics.

Concept:

- A premium dark chess-arcade composition.
- Center focus on a real QuickMate board position with a forcing mate threat.
- Add subtle Rush energy using teal motion accents and gold highlights.
- Include a compact hint of progression: Ladder path, boss silhouette, or earned cosmetic reward.
- Keep chests/rewards visually framed as earned progression/cosmetic content, not purchasable loot.

Background:

- Dark navy/charcoal base that matches the app.
- Gold and teal accents for speed and tactical clarity.
- Avoid pure black, pure white, or flat dark gray as the dominant background.
- Avoid tiny detail that will disappear on small Play Store surfaces.

App logo use:

- Use `public/brand/quickmate-logo.png` or a clean logo lockup.
- Keep the logo readable but not so dominant that it duplicates the app icon.
- Keep logo and key text away from crop/cutoff zones.

Assets needed:

- `public/brand/quickmate-logo.png`
- `public/brand/quickmate-app-icon.png`
- `public/brand/quickmate-og-image.png`
- One clean Rush or Mate Challenge board capture.
- Optional Collection/achievement reward accent from a real screenshot.
- Optional boss/campaign visual if it reads clearly at 1024x500.

Alt text draft:

QuickMate feature graphic with a chess tactics board, gold logo, and text: Fast chess tactics. Daily rush. Boss battles.

## Final Capture QA

Before upload, verify each screenshot:

- Uses the current app build and actual in-app UI.
- Has no debug overlays, browser chrome, personal data, or notifications.
- Is sharp at 1080x1920 or approved target size.
- Has no distorted scaling or sideways rotation.
- Keeps important UI away from cut edges.
- Does not overpromise features, monetization, rankings, or availability.
- Does not imply real-money gambling, trading, wagering, cash value, or paid chests.

## References

- Google Play preview assets: https://support.google.com/googleplay/android-developer/answer/9866151
- Google Play listing prep: `docs/google-play-listing.md`
