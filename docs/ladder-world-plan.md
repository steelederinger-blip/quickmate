# QuickMate Ladder World Plan

Ladder World is the progression and journey mode for QuickMate. Rush remains the main arcade/replay mode, while Ladder World gives players a map to clear over time, earn cosmetic rewards, defeat chess-themed bosses, and build a collectible chess-piece collection.

The design should feel like chess plus a mobile progression world: zones, nodes, chests, boss gates, and collection completion. It must stay chess-first and avoid pay-to-win mechanics.

## Design Principles

- Chess skill comes first: progress should come from solving puzzles and learning themes.
- Rewards should be cosmetic or status-based at first.
- No pay-to-win.
- No paid extra lives.
- No score boosts from collectibles.
- No collectible should make puzzles easier mechanically.
- Collection should create a long-term chase without undermining puzzle integrity.
- Ladder World should help organize puzzle content by theme, difficulty, and mate depth.

## World Zones

### Pawn Village

- Zone focus: first tactics, board vision, direct mates, simple forcing moves
- Suggested mateIn range: 1
- Difficulty range: starter to easy
- Puzzle themes/motifs: back-rank basics, protected queen mates, protected rook mates, boxed king, promotion finish
- Boss name: The Pawn Captain
- Boss concept: a short tutorial boss that tests direct mate recognition with no time pressure
- Reward ideas: starter coins, Classic Pawn cosmetic, first badge, small XP bundle
- Collectible pieces: Classic Pawn, Bronze Pawn

### Knight Woods

- Zone focus: knight patterns, forks, smothered shapes, unusual attacking geometry
- Suggested mateIn range: 2 to 3
- Difficulty range: easy to medium
- Puzzle themes/motifs: knight-mate, smothered-mate, fork-to-mate, king traps, decoys, deflections, discovered checks
- Boss name: The Smothered King
- Boss concept: a boss sequence where knight coverage, cramped kings, and decoy/deflection motifs close the mating net
- Reward ideas: Knight Woods Badge, Bronze Knight, Tactical/Royal chests, XP
- Collectible pieces: Classic Knight, Bronze Knight, Shadow Knight

### Bishop Tower

- Zone focus: diagonal control, long-range coverage, mating nets built around bishops
- Suggested mateIn range: 2 to 4
- Difficulty range: easy to medium
- Puzzle themes/motifs: bishop-diagonal, pins, pinned defenders, discovered-check, clearance, deflection, decoy, diagonal mate, queen sacrifice
- Boss name: The Diagonal Keeper
- Boss concept: a boss sequence that tests diagonal control, pinned defenders, discovered attacks, and bishop-led mating patterns
- Reward ideas: Bishop Tower Badge, Shadow Bishop, Tactical/Royal chests, XP
- Collectible pieces: Classic Bishop, Shadow Bishop, Royal Bishop

### Rook Fortress

- Zone focus: files, ranks, back-rank pressure, clearance, rook lifts
- Suggested mateIn range: 2 to 3
- Difficulty range: medium to advanced
- Puzzle themes/motifs: rook-file, back-rank, deflection, decoy, clearance, overloaded defender
- Boss name: The Fortress Warden
- Boss concept: a defensive boss where the player must break through file blockers and pinned guards
- Reward ideas: Rook Fortress badge, Bronze Rook, fortress frame cosmetic, larger coin chest
- Collectible pieces: Classic Rook, Bronze Rook, Shadow Rook

### Queen's Court

- Zone focus: queen coordination, sacrifices, forcing checks, high-impact attacking moves
- Suggested mateIn range: 2 to 3
- Difficulty range: medium to advanced
- Puzzle themes/motifs: queen-sacrifice, deflection, decoy, king-hunt, queen battery, overloaded defender
- Boss name: The Court Queen
- Boss concept: a boss battle built around queen sacrifices and precise follow-up mates
- Reward ideas: Queen's Court badge, Royal Queen fragment, premium-looking cosmetic banner
- Collectible pieces: Classic Queen, Bronze Queen, Royal Queen

### King's Gate

- Zone focus: defensive resources, exact forcing lines, final-rank control, boss-gate pressure
- Suggested mateIn range: 2 to 4
- Difficulty range: advanced to expert
- Puzzle themes/motifs: king-hunt, double-check, discovered-check, quiet move, gate unlock sequence, no-escape nets
- Boss name: The Gatekeeper King
- Boss concept: a gate boss that requires several clean solves with limited lives before Grandmaster Keep unlocks
- Reward ideas: King's Gate badge, Shadow King, gate key cosmetic, large XP bundle
- Collectible pieces: Classic King, Shadow King, Royal King

### Grandmaster Keep

- Zone focus: deep calculation, mixed motifs, final mastery, long-term aspirational content
- Suggested mateIn range: 3 to 4, later 5+
- Difficulty range: expert to master
- Puzzle themes/motifs: multi-theme combinations, quiet-move forcing lines, sacrifice, king-hunt, promotion, overloaded defender
- Boss name: The Grandmaster
- Boss concept: an end-zone boss gauntlet with multiple lives, mixed themes, and no obvious repeated pattern
- Reward ideas: Grandmaster badge, Grandmaster Set pieces, animated title, end-zone completion frame
- Collectible pieces: Grandmaster Pawn, Grandmaster Knight, Grandmaster Bishop, Grandmaster Rook, Grandmaster Queen, Grandmaster King

## Node Types

- Puzzle Node: a single puzzle or small fixed puzzle sequence.
- Theme Challenge: a set of puzzles sharing a theme, such as knight-mate or deflection.
- Boss Battle: a multi-puzzle encounter with lives, theme identity, and a zone-ending reward.
- Chest Node: a reward-only node unlocked by clearing prior nodes.
- Reward Node: a milestone node that grants XP, coins, badges, or collection pieces.
- Gate/Unlock Node: a requirement check that blocks progress until the player clears specific prior nodes, completes a set, or beats a boss.

## Ladder Node Data Model

```js
{
  id: 'pawn-village-001',
  zoneId: 'pawn-village',
  type: 'Puzzle Node',
  title: 'Back Rank Basics',
  description: 'Find the direct mate and learn the first file pattern.',
  puzzleIds: ['v2-001'],
  clearRequirement: {
    type: 'solveAll',
    maxMistakes: null,
    requirePerfect: false,
  },
  lives: null,
  timerSeconds: null,
  rewardXp: 25,
  rewardCoins: 10,
  rewardPiece: null,
  rewardBadge: null,
  unlocksNext: ['pawn-village-002'],
}
```

Field notes:

- `id`: stable unique node id.
- `zoneId`: stable id for the world zone.
- `type`: one of Puzzle Node, Theme Challenge, Boss Battle, Chest Node, Reward Node, or Gate/Unlock Node.
- `title`: short display name.
- `description`: one or two sentence node summary.
- `puzzleIds`: ordered puzzle ids used by the node.
- `clearRequirement`: structured condition for clearing the node.
- `lives`: optional lives for challenge or boss nodes.
- `timerSeconds`: optional timer for challenge or boss nodes.
- `rewardXp`: XP granted on first clear.
- `rewardCoins`: soft currency granted on first clear.
- `rewardPiece`: optional collectible piece id.
- `rewardBadge`: optional badge id.
- `unlocksNext`: node ids unlocked after clear.

## Collection System Data Model

```js
{
  setId: 'classic-set',
  setName: 'Classic Set',
  rarity: 'common',
  pieces: {
    Pawn: 'classic-pawn',
    Knight: 'classic-knight',
    Bishop: 'classic-bishop',
    Rook: 'classic-rook',
    Queen: 'classic-queen',
    King: 'classic-king',
  },
  unlockSource: 'Ladder starter progression',
  cosmeticReward: 'Classic board trim',
}
```

Field notes:

- `setId`: stable unique set id.
- `setName`: display name.
- `rarity`: common, uncommon, rare, epic, legendary, or event.
- `pieces`: exactly Pawn, Knight, Bishop, Rook, Queen, and King.
- `unlockSource`: where pieces can be earned.
- `cosmeticReward`: non-gameplay reward for completing the set.

## Initial Collectible Sets

### Classic Set

- Rarity: common
- Unlock source: early Ladder World nodes and tutorial milestones
- Cosmetic reward: Classic board trim

### Bronze Set

- Rarity: uncommon
- Unlock source: Pawn Village, Knight Woods, Rook Fortress, and basic chests
- Cosmetic reward: Bronze profile frame

### Shadow Set

- Rarity: rare
- Unlock source: Knight Woods, Rook Fortress, King's Gate, and Rush chests
- Cosmetic reward: Shadow piece skin

### Royal Set

- Rarity: epic
- Unlock source: Bishop Tower, Queen's Court, King's Gate, and boss battle wins
- Cosmetic reward: Royal board accent

### Grandmaster Set

- Rarity: legendary
- Unlock source: Grandmaster Keep bosses, full-zone completions, and high-tier challenge milestones
- Cosmetic reward: Grandmaster title and animated profile frame

## Reward Sources

- Rush chests: earned from Rush milestones, streaks, or run performance.
- Ladder node clears: first-clear rewards for normal progression, including XP and local cosmetic chests.
- Boss battle wins: larger rewards tied to zone identity, including badges and unique collection pieces.
- Daily Rush streaks: light recurring rewards for returning players.
- Zone completions: major rewards for clearing every required node in a zone.

### Pawn Village v1 Rewards

- Welcome Mate: 25 XP and a Basic Chest on first clear.
- Back Rank Basics: 25 XP and a Basic Chest on first clear.
- Queen and Rook Finish: 25 XP and a Tactical Chest on first clear.
- No-Hint Challenge: 25 XP and a Tactical Chest on first clear.
- Boss: Back Rank Guard: 100 XP, the Back Rank Guard Badge, and the Bronze Rook collection piece on first clear.
- If the boss-specific piece is already owned, the boss awards a Royal Chest fallback instead.
- Ladder rewards are cosmetic/status-based only; they must not grant extra lives, score boosts, timer bonuses, or other gameplay advantages.

### Knight Woods v1 Rewards

- Knight Fork Intro: 35 XP and a Tactical Chest on first clear.
- Smothered Mate Trail: 35 XP and a Tactical Chest on first clear.
- Forest Trap: 35 XP and a Tactical Chest on first clear.
- No-Queen Challenge: 35 XP and a Royal Chest on first clear.
- Boss: The Smothered King: 125 XP, the Knight Woods Badge, and the Bronze Knight collection piece on first clear.
- If the boss-specific piece is already owned, the boss awards a Royal Chest fallback instead.

### Bishop Tower v1 Rewards

- Diagonal Entry: 45 XP and a Tactical Chest on first clear.
- Pin the Defender: 45 XP and a Tactical Chest on first clear.
- Discovered Line: 45 XP and a Royal Chest on first clear.
- Clearance Path: 45 XP and a Royal Chest on first clear.
- Boss: The Diagonal Keeper: 150 XP, the Bishop Tower Badge, and the Shadow Bishop collection piece on first clear.
- If the boss-specific piece is already owned, the boss awards a Royal Chest fallback instead.

## MVP Implementation Phases

### Phase 1: Docs and Data Model Only

- Define zones, nodes, collection sets, and reward vocabulary.
- Keep all implementation out of gameplay.
- Use docs to guide future app data structures.

### Phase 2: Static Ladder World Screen

- Replace the plain Ladder list with a static world map or zone list.
- Show locked/unlocked visual states without persistence yet.
- Keep puzzle launching simple.

### Phase 3: Node Completion Saved in localStorage

- Track cleared nodes, boss wins, zone progress, and basic completion state locally.
- Keep all data client-side.
- Avoid accounts or backend requirements.

### Phase 4: Reward Unlocks and Collection Tracking

- Add local collection inventory.
- Award cosmetic/status rewards on node clears, boss wins, and chests.
- Show set completion progress.

### Phase 5: Boss Battles

- Add boss battle node rules: lives, puzzle sequence, clear requirements, and reward reveal.
- Start with deterministic boss encounters before adding variants.

### Phase 6: Animations, Cosmetics, and Polish

- Add map movement, chest opening, set completion effects, badges, profile frames, and piece cosmetics.
- Keep animations lightweight and responsive on mobile.

## Open Tuning Questions

- How many nodes should each zone contain for the first playable Ladder World?
- Should boss battles allow retries immediately or require clearing nearby nodes again?
- Should Rush chests award pieces from all sets or only sets unlocked by Ladder progress?
- Should collection duplicates convert to coins, XP, or cosmetic dust?
- What is the right balance between themed learning and surprise variety inside each zone?
