# QuickMate Google Play Console Declaration Answers

Status: draft answers for the current QuickMate Android build. Re-check against the exact AAB before submission. This is not legal advice.

## Current App Facts

- Developer account: TemperedPro
- App name: QuickMate
- Package ID: `com.quickmate.app`
- Privacy policy: https://quickmate.netlify.app/privacy
- Support URL: https://quickmate.netlify.app/support
- Support email: quickmateapp@gmail.com
- Current build: Android Capacitor app with signed release AAB built locally.
- Current monetization: no ads, no in-app purchases, no subscriptions.
- Current data model: no accounts, no backend, no analytics, no external APIs.
- Current progress storage: local gameplay progress stored on device through the web app layer/localStorage.

## App Access

Recommended Play Console answer:

- No special access required.
- No login required.
- No account creation required.
- All gameplay is available without account credentials, membership, location-based access, payment, or reviewer-only instructions.

Reviewer instructions:

No credentials are needed. Open the app and use any mode from the home screen.

## Ads Declaration

Recommended current-build answer:

- Does the app contain ads? No.

Notes:

- The current submitted build does not include ads or ad SDKs.
- Future versions may add ads and an optional remove-ads in-app purchase.
- Update the Ads declaration, Data Safety, target-audience/ad-suitability answers, privacy policy, and SDK disclosures before submitting any ad-enabled build.

## Content Rating Prep

Likely questionnaire direction for current build:

- Category: Game.
- Violence: No realistic violence. Chess captures/checkmate are abstract board-game actions.
- Gambling: No gambling.
- Real-money gambling: No.
- Simulated gambling: No.
- Randomized purchases: No purchases in the current build.
- User-generated content: No.
- Chat or user communication: No.
- Social features: No.
- Location sharing: No.
- Sexual content or nudity: No.
- Drugs, alcohol, or tobacco: No.
- Scary or horror content: No.
- Profanity or crude humor: No.
- Current in-app purchases: No.
- Current subscriptions: No.

Rewards/chests wording:

- Chests are earned in-game cosmetic/progression rewards only.
- Chests have no cash value.
- No trading.
- No wagering.
- No cash-out.
- No purchase mechanic in the current build.

Owner check before submission:

- Complete the Play Console/IARC questionnaire exactly as shown. The final rating comes from Play Console based on the official questionnaire, not from this draft.

## Target Audience

Recommended draft:

- QuickMate is not designed specifically for children.
- Recommended target audience: 13+ / teens and adults, depending on the exact age-group choices shown in Play Console.
- Do not select under-13 audiences unless the app, listing, screenshots, SDKs, privacy approach, and future monetization plan are intentionally prepared for Google Play Families requirements.

Rationale:

QuickMate is a chess tactics game for users who can read game UI, understand chess rules, and engage with timed tactics, ladder progression, boss battles, achievements, and collection systems. It is not marketed as a kids/family-directed app.

## Data Safety

Recommended current-build Data Safety position:

- Account creation: No.
- Personal data collected by QuickMate app code: No.
- Data shared with third parties by QuickMate app code: No.
- Precise location: No.
- Approximate location: No.
- Contacts: No.
- Photos or videos: No.
- Camera: No.
- Microphone/audio recordings: No.
- Financial or payment data: No.
- Health or fitness data: No.
- Messages, emails, SMS/MMS, or in-app messages: No.
- Files and documents: No.
- Calendar: No.
- App activity sent to developer/backend: No.
- Web browsing history sent to developer/backend: No.
- Device or advertising IDs collected by QuickMate app code: No known collection in the current build.

Local data note:

- Gameplay progress is stored locally on the device through localStorage in the web app layer.
- Local progress may include scores, streaks, puzzle progress, achievements, collection items, selected themes, chests, and gameplay stats.
- Local-only progress is not transmitted off device by current QuickMate app functionality.
- Clipboard copy/share actions are user-initiated only and do not send data to a QuickMate server.

Data Safety caution:

- Google Play says developers are responsible for accurate declarations, including behavior from SDKs and third-party libraries used by the app.
- Google/Android/Play services may process platform-level data outside QuickMate app code and outside these app-specific declarations.
- Before submitting an AAB, re-check the built APK/AAB permissions, dependencies, SDKs, network behavior, and privacy policy.
- If ads, IAP, subscriptions, analytics, crash reporting, push notifications, accounts, backend APIs, or external SDKs are added later, update Data Safety and privacy disclosures before release.

## Financial Features

Recommended current-build answers:

- No financial products or services.
- No banking.
- No crypto or digital asset trading.
- No loans.
- No insurance.
- No investment features.
- No money transfer.
- No payments or in-app purchases in the current build.

Future note:

If remove-ads IAP is added later, configure Google Play Billing and update store declarations before submitting that build.

## Health / News / Government / Kids / Other Declarations

Recommended current-build answers:

- Health app: No.
- Medical app: No.
- Fitness/wellness tracking: No.
- News or magazine app: No.
- Government app: No.
- Election app or political app: No.
- Designed for kids/families: No.
- COVID-19/contact tracing/status app: No.
- Tobacco or nicotine product app: No.
- Gambling app: No.
- Real-money gambling: No.
- Simulated gambling: No.
- Dating app: No.
- Social networking app: No.
- User-generated content platform: No.

## App Category and Tags

Recommended category:

- Game / Puzzle

Alternate category:

- Game / Board

Suggested tags to evaluate if available:

- Chess
- Puzzle
- Strategy
- Brain training
- Casual

Tag caution:

Use only tags that are available in Play Console and obviously supported by the store listing and first-run app experience.

## Internal Testing Release Notes Draft

Initial internal test build of QuickMate.

Includes Rush, Daily Rush, Endless Survival, Ladder World, Boss Battles, Mate Challenge, Collection, Achievements, and board/piece themes.

Progress is stored locally on this device.

## Play Review Notes Draft

QuickMate is a chess tactics game focused on checkmate puzzles, timed Rush modes, Daily Rush, Endless Survival, Ladder World, Boss Battles, Mate Challenge, Collection, Achievements, and board/piece themes.

No login is required. All gameplay is available without account credentials.

The current build does not include ads, in-app purchases, subscriptions, analytics, backend services, or external APIs.

Chests are earned in-game progression/cosmetic rewards only. They have no real-money gambling, cash-out, trading, wagering, or randomized purchase mechanic.

Progress is stored locally on the device. Clearing app data may remove local scores, streaks, achievements, collection items, themes, chests, and gameplay stats.

## Owner Decisions Before Submission

- Confirm exact target age group selection in Play Console. Recommended direction is 13+ / teens and adults, not under-13 or Families.
- Confirm whether the first internal test track requires completing Data Safety now or later in the specific Play Console flow.
- Confirm whether to use Game / Puzzle or Game / Board after viewing available category/tag suggestions in Play Console.
- Confirm release notes wording in Play Console before upload.
- Confirm the final signed AAB contains no new SDKs, permissions, analytics, ads, billing, push notification, or backend behavior.

## Reference Links Checked

- Prepare your app for review / App content declarations: https://support.google.com/googleplay/android-developer/answer/9859455
- Data Safety form guidance: https://support.google.com/googleplay/android-developer/answer/10787469
- Content rating requirements: https://support.google.com/googleplay/android-developer/answer/9859655
- Target audience and app content settings: https://support.google.com/googleplay/android-developer/answer/9867159
- Category and tags guidance: https://support.google.com/googleplay/android-developer/answer/9859673
- Store setup and contact details: https://support.google.com/googleplay/android-developer/answer/9859152
