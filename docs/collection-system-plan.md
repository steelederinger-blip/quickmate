# QuickMate Collection System Plan

Collection is the long-term chase for QuickMate. Rush remains the arcade and replay mode. Ladder World remains the journey and progression map. Collection rewards should give players reasons to keep solving without making puzzles easier or scores artificially stronger.

## Collection Goals

- Give players a reason to keep playing Rush.
- Reward Ladder World progression.
- Let players complete chess piece sets.
- Support future cosmetics like board themes, piece styles, profile frames, and result frames.
- Avoid gameplay advantages from collectibles.
- Keep early rewards cosmetic and status-based only.
- Avoid pay-to-win mechanics.
- Avoid accounts, Supabase, payments, and app-store logic for now.

## Collectible Categories

- Piece Sets: collectible Pawn, Knight, Bishop, Rook, Queen, and King pieces grouped by set.
- Board Themes: cosmetic board palettes or board frames.
- Badges: profile/status achievements shown in results, Ladder World, or future profiles.
- Profile Frames: cosmetic frame around a future player profile area.
- Rush Result Frames: cosmetic treatment for Rush result screens.
- Combo Effects: lightweight visual effects for combos, with no score or timer advantage.

## Initial Piece Sets

Each piece set includes:

- Pawn
- Knight
- Bishop
- Rook
- Queen
- King

### Classic Set

- Rarity: Common
- Theme: clean chess starter set
- Intended unlock source: early Ladder nodes and starter rewards
- Cosmetic reward: Classic board trim

### Bronze Set

- Rarity: Common
- Theme: early progression and sturdy tournament pieces
- Intended unlock source: Pawn Village, Knight Woods, Basic Chests, Tactical Chests
- Cosmetic reward: Bronze profile accent

### Shadow Set

- Rarity: Rare
- Theme: dark tactical pieces for sharper motifs
- Intended unlock source: Knight Woods, Rook Fortress, Tactical Chests, Survival Chests
- Cosmetic reward: Shadow result frame

### Royal Set

- Rarity: Epic
- Theme: polished court pieces tied to queen, bishop, and king progression
- Intended unlock source: Bishop Tower, Queen's Court, Royal Chests, boss wins
- Cosmetic reward: Royal board theme

### Grandmaster Set

- Rarity: Legendary
- Theme: endgame mastery and long-term completion
- Intended unlock source: Grandmaster Keep, Legendary Chests, major zone completions
- Cosmetic reward: Grandmaster title and frame

## Rarity Levels

- Common: early and broadly available items.
- Rare: stronger zone identity or recurring Rush chest rewards.
- Epic: boss-linked, zone-completion, or high-rank Rush rewards.
- Legendary: late Ladder World or high-performing Survival rewards.
- Mythic: future seasonal or special-event cosmetic tier.

## Reward Sources

- Rush chests
- Ladder node clears
- Boss battle wins
- Zone completions
- Daily Rush streaks
- Future seasonal events

## Rush Chest Types

### Basic Chest

- Intended source: Blitz Rush clears, early ranks, daily activity
- Reward feel: common pieces, starter badges, small cosmetic progress

### Tactical Chest

- Intended source: strong Blitz runs, Classic Rush runs, improved ranks
- Reward feel: common or rare pieces, tactical badges, basic result frames

### Royal Chest

- Intended source: strong Classic runs, Survival milestones, boss-adjacent rewards
- Reward feel: rare or epic pieces, Royal Set chances, board theme fragments

### Survival Chest

- Intended source: Survival Rush depth milestones and long-run achievements
- Reward feel: rare or epic pieces, Shadow Set and late-zone cosmetics

### Legendary Chest

- Intended source: high-rank Survival runs, major new best scores, Grandmaster Keep milestones
- Reward feel: epic, legendary, or future mythic cosmetic chances

## Chest Reward Rules

- Blitz Rush can award Basic and Tactical Chests.
- Classic Rush can award Tactical and Royal Chests.
- Survival Rush can award Survival, Royal, and Legendary Chests.
- New best score can trigger a bonus chest.
- Higher rank results should improve chest quality.
- Chests should award cosmetic and status items only.
- Chests should not award score boosts, extra lives, puzzle hints, or timer advantages.
- Duplicate handling can be deferred, but likely options are coins, cosmetic dust, or collection XP.

## Collection Data Model

```js
{
  collectionItemId: 'classic-pawn',
  category: 'piece-set',
  setId: 'classic-set',
  setName: 'Classic Set',
  pieceType: 'Pawn',
  rarity: 'Common',
  displayName: 'Classic Pawn',
  unlockSource: 'Ladder starter progression',
  cosmeticReward: 'Classic board trim progress',
  owned: false,
  unlockedAt: null,
}
```

Field notes:

- `collectionItemId`: stable unique item id.
- `category`: collectible category, such as `piece-set`, `board-theme`, `badge`, `profile-frame`, `rush-result-frame`, or `combo-effect`.
- `setId`: optional set grouping.
- `setName`: optional display set name.
- `pieceType`: optional chess piece type for piece sets.
- `rarity`: Common, Rare, Epic, Legendary, or Mythic.
- `displayName`: player-facing item name.
- `unlockSource`: where the item can be earned.
- `cosmeticReward`: associated cosmetic or set-completion reward.
- `owned`: future local unlock state.
- `unlockedAt`: future local timestamp when unlocked.

## Future localStorage Model

Use localStorage only when implementation begins.

```js
{
  ownedCollectionItems: ['classic-pawn'],
  equippedPieceSet: 'classic-set',
  equippedBoardTheme: 'classic-board',
  equippedProfileFrame: null,
  unopenedChests: [
    {
      chestId: 'local-chest-001',
      chestType: 'Basic Chest',
      earnedFrom: 'Blitz Rush',
      earnedAt: '2026-06-13T00:00:00.000Z',
    },
  ],
  collectionStats: {
    totalItemsOwned: 1,
    setsCompleted: 0,
    chestsOpened: 0,
    duplicateItemsFound: 0,
  },
}
```

## MVP Implementation Phases

### Phase 1: Docs and Static Data Only

- Define collection categories, set names, rarity vocabulary, and chest types.
- Add static data without app wiring.
- Do not change gameplay.

### Phase 2: Create `src/collections.js` with Collectible Definitions

- Export initial piece set definitions.
- Export chest type definitions.
- Export rarity definitions.
- Keep data simple and readable.

### Phase 3: Add Collection Screen Showing Locked/Unlocked Sets

- Show piece sets and item slots.
- Default all items locked until local unlock logic exists.
- Keep the screen informational at first.

### Phase 4: Award Simple Rush Chests Locally After Rush Runs

- Add localStorage chest rewards from Rush results.
- Keep rewards cosmetic/status-only.
- Avoid changing Rush score, timers, or lives.

### Phase 5: Open Chest Screen and Local Unlocks

- Let players open local chests.
- Unlock collection items locally.
- Track duplicates locally.

### Phase 6: Connect Ladder World Rewards to Specific Pieces

- Award pieces from node clears, boss wins, and zone completions.
- Keep Ladder rewards deterministic where useful for progression clarity.

### Phase 7: Cosmetics and Equipping Later

- Allow players to equip piece sets, board themes, profile frames, result frames, and combo effects.
- Keep all cosmetics visual only.

## Guardrails

- No pay-to-win.
- No paid extra lives.
- No paid hints.
- No score boosts from collectibles.
- No timer boosts from collectibles.
- No accounts or backend storage in v1.
- No Supabase, payment, or app-store logic.
