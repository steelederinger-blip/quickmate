# QuickMate Google Play Store Listing Prep

Status: draft for Google Play metadata and submission answers. Do not treat this as a final legal review.

## App Identity

- App name: QuickMate
- Developer: TemperedPro
- Support email: quickmateapp@gmail.com
- Privacy policy: https://quickmate.netlify.app/privacy
- Support URL: https://quickmate.netlify.app/support
- Terms URL: https://quickmate.netlify.app/terms
- App type: Game
- Recommended category: Game / Puzzle
- Secondary category fit: Game / Board
- Rationale: QuickMate is chess-based, but the primary store-listing promise is fast checkmate puzzle solving, mode progression, and tactics training. Puzzle is likely the clearest first fit for new users; Board is a reasonable alternate if Play Console positioning should lean harder into chess.
- Suggested tags to evaluate in Play Console: Chess, Puzzle, Board, Strategy, Single player

## Short Description

Fast chess tactics with Rush modes, daily puzzles, ladders, and rewards

Character count: 71 of 80.

## Full Description

Train your checkmate vision in QuickMate, a fast chess tactics game built for short, focused sessions and long-term progression.

Solve forcing chess puzzles, chase better scores, and build your collection across arcade-style modes:

- Rush modes for timed tactical sprints.
- Daily Rush with a fresh daily puzzle run and streak tracking.
- Endless Survival for no-clock pressure where one wrong move ends the run.
- Ladder World campaign with themed worlds and progression nodes.
- Boss battles that turn tactics into milestone challenges.
- Mate Challenge practice for checkmate-before-the-limit puzzles.
- Collection rewards, achievements, board themes, and piece themes.

QuickMate focuses on chess tactics, not real-money rewards. Chests and rewards are earned through play and are cosmetic or progression-based only. They have no cash value, no wagering, no trading, and no gambling mechanic.

Current progress is stored locally on your device. If app data is cleared or you change devices, local scores, streaks, puzzle progress, achievements, themes, and collection progress may be lost.

QuickMate currently does not require an account, does not show ads, does not include in-app purchases, and does not use subscriptions.

## Screenshot Checklist

Google Play allows up to 8 screenshots per supported device type. For phone launch, prepare 8 portrait phone screenshots from the actual app experience, preferably 1080x1920 PNG or JPEG.

1. Home screen
   - Caption: Fast chess puzzles. Daily Rush. Build your collection.
   - Capture goal: first screen with Rush, Daily Rush, Ladder World, Collection, and practice entry points visible.

2. Rush mode
   - Caption: Sprint through forcing mate puzzles in Rush.
   - Capture goal: active Classic or Blitz Rush puzzle with board, timer, lives, score, and move panel visible.

3. Daily Rush
   - Caption: Take on a fresh Daily Rush and grow your streak.
   - Capture goal: Daily Rush start or active daily run showing daily identity/streak context.

4. Mate Challenge
   - Caption: Checkmate before your attacking move limit expires.
   - Capture goal: active Mate Challenge puzzle with attacking moves left and board visible.

5. Ladder World
   - Caption: Climb themed worlds through tactical campaign nodes.
   - Capture goal: campaign map or world selection showing progress nodes and world identity.

6. Boss battle
   - Caption: Clear boss puzzles to prove your tactical streak.
   - Capture goal: active boss battle or boss intro with board/challenge framing visible.

7. Collection and themes
   - Caption: Unlock cosmetic pieces, boards, and collection rewards.
   - Capture goal: Collection page showing pieces, themes, or chest progress. Avoid implying purchases or cash value.

8. Achievements
   - Caption: Track milestones, streaks, clears, and mode mastery.
   - Capture goal: achievements view with visible progress and unlocked/locked achievement states.

Screenshot guidance:

- Use real in-app UI, not mockups.
- Keep overlays minimal; if captions are added to images, keep them short and under about 20% of the screenshot area.
- Do not use "best," "#1," "top," "free," "download now," or other ranking, promotion, or call-to-action language.
- Do not show system notifications, personal data, debug labels, browser chrome, or emulator controls.
- Make chests/rewards visually and textually clear as earned cosmetic/progression rewards only.

## Feature Graphic Plan

Required size: 1024x500.

Recommended text:

QuickMate
Fast chess tactics

Alternate text:

QuickMate
Mate puzzles, fast.

Visual concept:

- Center a clean QuickMate chess board moment with a high-contrast mate threat.
- Use the gold knight/Q logo as a brand anchor, but do not duplicate the app icon too heavily.
- Add subtle Rush energy using teal motion accents and a premium dark chess-arcade background.
- Include hints of collection progression such as a cosmetic piece silhouette or small reward sparkle, but avoid anything that looks like a purchasable loot box.
- Keep main logo, app name, and slogan away from edges/cutoff zones.

Assets to use:

- `public/brand/quickmate-logo.png`
- `public/brand/quickmate-app-icon.png`
- `public/brand/quickmate-og-image.png`
- Actual app screenshots or board captures from Rush/Mate Challenge

Needs new graphic: yes. Current brand assets are useful source material, but a dedicated 1024x500 Google Play feature graphic should be created before submission.

## Play Console Declaration Notes

### App Access

Draft answer: All app features in the current build are accessible without login, account creation, paid access, special credentials, or reviewer instructions.

Review note: If a future build adds accounts, gated modes, purchases, subscriptions, or server-side tests, update App access instructions before submission.

### Ads Declaration

Draft answer for current build: No, the app does not contain ads.

Important future note: TemperedPro plans future ads and a remove-ads in-app purchase. Do not declare ads until ads are actually present in the submitted build, but update this answer, Data safety, age/ads suitability, SDK disclosures, and privacy policy before any ad-enabled build is submitted.

### Content Rating

Draft notes:

- Content type: Game.
- Core content: chess tactics and checkmate puzzles.
- No realistic violence, blood, gore, sexual content, profanity, user-generated content, chat, or real-money gambling.
- Chests/rewards are earned in-game cosmetic/progression rewards only.
- No cash value, no wagering, no trading, no cash-out, and no current purchase mechanic.

Expected direction: likely a low/general rating, but the final rating must come from the Play Console/IARC questionnaire responses.

### Target Audience

Recommended draft selection: 13-15, 16-17, and 18+.

Rationale: QuickMate is a general chess tactics game and is not designed primarily for children under 13. Avoid selecting under-13 age groups unless the app, store listing, screenshots, ads plan, SDKs, and privacy approach are intentionally prepared for Google Play Families requirements.

### News Apps

Draft answer: No. QuickMate is not a news or magazine app.

### Government Apps

Draft answer: No. QuickMate is not a government app and does not represent a government entity.

### Financial Features

Draft answer: No. QuickMate does not provide financial products, financial advice, money transfer, lending, investing, insurance, or payment features.

### Health Apps

Draft answer: No. QuickMate does not provide health, medical, fitness, wellness tracking, diagnosis, treatment, or health advice features.

### Data Safety

Draft answer for current build:

- No account required.
- No names, email addresses, phone numbers, location, contacts, photos, camera, microphone, payment information, or financial information collected by the app.
- No ads currently.
- No analytics currently.
- No backend currently.
- No external gameplay APIs currently.
- No current in-app purchases or subscriptions.
- Gameplay progress is stored locally on the device using localStorage in the web app layer.
- Local progress may include scores, streaks, puzzle progress, achievements, collection items, selected themes, chests, and gameplay stats.
- Local-only app data is not transmitted off the device by current app functionality.
- Clipboard copy/share actions are user-initiated only.

Data Safety caution:

- Confirm the final Android build does not add SDKs, permissions, crash reporting, analytics, advertising identifiers, WebView data transfer, or backend calls before answering "no data collected."
- If Capacitor, Android, crash tooling, ads, billing, or analytics introduces off-device data collection, update Data Safety and the privacy policy before submission.

### Privacy Policy

Draft URL: https://quickmate.netlify.app/privacy

Notes:

- Privacy page currently states no account, no ads, no payments, no analytics, local-only progress, user-initiated clipboard/share, and normal hosting/server log possibility for website access.
- Re-review before store submission after release signing, Android permissions, and any SDK changes.

### App Category

Draft answer:

- Type: Game
- Category: Puzzle
- Alternate category: Board

### Contact Details

Draft answers:

- Support email: quickmateapp@gmail.com
- Support website: https://quickmate.netlify.app/support
- Privacy policy: https://quickmate.netlify.app/privacy
- Developer: TemperedPro

## Play Review Notes Draft

QuickMate is a chess tactics game focused on checkmate puzzles, timed Rush modes, Daily Rush, Endless Survival, campaign progression, boss battles, Mate Challenge practice, achievements, board themes, piece themes, and earned collection rewards.

The current build does not require an account, does not include ads, does not include in-app purchases, and does not include subscriptions.

Chests and rewards in QuickMate are earned in-game progression/cosmetic rewards only. They have no real-money gambling, no wagering, no cash value, no cash-out, no trading, and no purchase mechanic in the current build.

Player progress is currently local to the device/browser app storage. Clearing app data or changing devices may remove local progress.

No special reviewer account or credentials are required for the current build.

## Missing Before Store Submission

- Google Play phone screenshots.
- Optional tablet screenshots if targeting tablets or large screens.
- Dedicated 1024x500 feature graphic.
- Confirm final 512x512 Play app icon meets Google Play icon requirements and file size limits.
- Signed release AAB.
- Release signing configuration.
- Internal testing release notes.
- Final Play Console Data safety answers based on the exact signed release build.
- Final content rating questionnaire answers.
- Final target audience selection.
- Final review notes pasted into Play Console.
- Confirm identity verification and phone verification are complete for the TemperedPro developer account.

## Reference Links Checked

- Google Play preview assets and store listing asset requirements: https://support.google.com/googleplay/android-developer/answer/9866151
- Google Play Data safety form overview: https://support.google.com/googleplay/android-developer/answer/10787469
- Google Play content rating requirements: https://support.google.com/googleplay/android-developer/answer/9859655
- Google Play target audience and app content settings: https://support.google.com/googleplay/android-developer/answer/9867159
- Google Play category and tags guidance: https://support.google.com/googleplay/android-developer/answer/9859673
