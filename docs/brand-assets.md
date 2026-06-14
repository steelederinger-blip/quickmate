# QuickMate Brand Assets

## Brand Direction

QuickMate should feel like a premium dark chess arcade: royal strategy, fast tactics, and a long-term collection chase. The visual center is a gold knight/Q logo with electric teal speed accents.

Tagline:

> Fast chess puzzles. Daily Rush. Build your collection.

## Color Direction

- Dark base: near-black navy and charcoal surfaces.
- Primary accent: royal gold for logo, key actions, scores, and reward moments.
- Speed accent: electric teal for motion, highlights, and future streak/speed effects.
- Supporting accent: royal purple for strategy/progression moments.
- State colors: green for success, amber for warnings, red for danger or missed puzzles.

## Asset Checklist

Place these files in `public/brand/`:

- `quickmate-logo.png`: home header logo/wordmark. The app falls back to a text QuickMate lockup if missing.
- `quickmate-app-icon.png`: favicon and Apple touch icon.
- `quickmate-splash.png`: reserved for future launch/splash presentation.
- `quickmate-og-image.png`: Open Graph and Twitter social preview image.

## Current App Usage

- `src/App.jsx` references `/brand/quickmate-logo.png` on the home screen with an `onError` fallback.
- `index.html` references `/brand/quickmate-app-icon.png` for icon metadata.
- `index.html` references `/brand/quickmate-og-image.png` for social preview metadata.
- `src/styles.css` includes responsive logo sizing and future splash presentation styles.

## Future App-Store Asset Needs

- iOS app icon set across required sizes.
- Android adaptive icon foreground/background.
- Store listing feature graphic.
- Store screenshots for phone and tablet sizes.
- Launch/splash art variants.
- Social/share preview variants for seasonal campaigns.
- Optional transparent logo and monochrome mark for system UI surfaces.

Keep all brand rewards and cosmetics visual/status-only. Brand assets must not imply pay-to-win boosts, purchasable power, or gameplay advantages.
