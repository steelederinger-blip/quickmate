# QuickMate Cinematic Moments Plan

Cinematic Moments are lightweight reward animations for major QuickMate milestones. They should make the game feel more polished and mobile-game-like while preserving the speed of Rush and keeping chess solving as the core experience.

## Goals

- Celebrate meaningful moments without slowing down play.
- Make Ladder bosses, zone clears, set completions, and rare unlocks feel more valuable.
- Add small, fast feedback for themed checkmates and Rush accomplishments.
- Keep all effects skippable, responsive, and respectful of reduced-motion preferences.
- Avoid complex art, video, heavy animation libraries, or anything that blocks gameplay unnecessarily.

## Possible Triggers

- Boss defeated: show a boss-specific banner after clearing a Ladder World boss.
- Zone cleared: show a zone completion panel after the final node in a zone.
- Set completed: show a collection completion reveal when all six pieces in a set are owned.
- New best Rush score: show a short non-blocking score highlight on the Rush result screen.
- Rare or Legendary piece unlocked: show a stronger collection reveal for higher rarity pieces.
- Themed checkmate: show a small checkmate flash for themes such as knight-mate, back-rank, bishop-diagonal, queen-sacrifice, rook-file, smothered-mate, or promotion.

## Animation Types

### Slide-In Panel

- Use for milestone messages such as zone clear, set complete, or major Rush bests.
- Enters from the bottom or side, stays briefly, then can dismiss.
- Should never hide essential controls for long.

### Badge Burst

- Use for boss badges, zone badges, and rare status rewards.
- Small scale/shine effect around a badge placeholder.
- Keep the effect text-first until real badge artwork exists.

### Quick Checkmate Flash

- Use for themed checkmates, especially in Rush.
- Very short flash, accent bar, or compact toast.
- Non-blocking and safe to skip entirely in reduced-motion mode.

### Collection Reveal

- Use for new piece unlocks and set completion.
- Can be slightly larger than Rush effects because it happens after a run or node clear.
- Should show rarity, set progress, and the unlocked item clearly.

### Boss Defeat Banner

- Use after boss nodes only.
- Stronger text, badge label, and zone identity.
- Short, skippable, and shown after the boss result is already determined.

## Rules

- Rush should only use very short, non-blocking animations.
- Boss, zone, and set-complete moments can use longer animations because gameplay is already paused or complete.
- All animations must be skippable.
- Respect `prefers-reduced-motion`; reduce or remove motion and use static emphasis instead.
- Never block gameplay for more than necessary.
- Do not add score boosts, timer bonuses, extra lives, or gameplay advantages through cinematic effects.
- Avoid showing frequent checkmate effects in a way that makes Rush feel slower.
- Effects should be text/icon-placeholder based until production artwork is ready.
- Animation state should be UI-only and should not affect puzzle, reward, or progression state.

## First MVP Implementation

Phase 1 should add a reusable `CinematicMoment` component without changing reward rules or puzzle logic.

Initial scope:

- Create a reusable `CinematicMoment` component.
- Add CSS-only motion using existing dark/gold/teal brand tokens.
- Add reduced-motion fallbacks.
- Trigger it on boss defeated and set completed first.
- Use text, lucide icons, and existing badge/item labels as placeholders.
- Keep it dismissible with a button and/or short auto-dismiss where appropriate.
- Do not add complex art, video, particles, canvas effects, or image assets yet.

Suggested component props:

```js
{
  type: 'boss-defeat' | 'set-complete' | 'collection-reveal' | 'checkmate-flash' | 'new-best',
  title: 'Boss Defeated',
  subtitle: 'Back Rank Guard Badge earned',
  detail: 'Pawn Village complete',
  tone: 'gold' | 'teal' | 'royal' | 'rare' | 'legendary',
  icon: 'trophy',
  dismissLabel: 'Continue',
  autoDismissMs: null,
  onDismiss: () => {},
}
```

## Trigger Priority

1. Boss defeated
2. Set completed
3. Legendary or rare piece unlocked
4. Zone cleared
5. New best Rush score
6. Themed checkmate flash

If multiple triggers happen at once, show the highest-priority moment first and fold secondary details into the same panel where possible. Avoid queues that require repeated taps before the player can continue.

## Rush-Specific Guidance

- Rush checkmate effects should be no more than a fast flash/toast.
- Do not interrupt the next puzzle load.
- Do not animate every ordinary solve if it makes the mode feel slower.
- Prefer stronger Rush effects only on result screens: new best score, best combo, rank milestone, or rare chest earned.

## Ladder and Collection Guidance

- Ladder bosses can use the strongest MVP treatment.
- Zone completion should feel important but should still lead clearly to the next zone or home action.
- Set completion should highlight the completed set and cosmetic reward.
- Collection reveals should emphasize rarity and progress without implying gameplay power.

## Accessibility and Performance

- Use CSS animations only for v1.
- Use transform and opacity where possible.
- Avoid layout-shifting animations.
- Keep animation duration short, usually 180ms to 600ms.
- Respect `@media (prefers-reduced-motion: reduce)`.
- Keep tap targets at least 46px.
- Ensure text remains readable on small screens.

## Non-Goals For v1

- No new gameplay logic.
- No puzzle data changes.
- No scoring, reward, or progression rule changes.
- No image or video assets.
- No particle systems or heavy animation libraries.
- No accounts, payments, Supabase, leaderboards, or app-store packaging.
