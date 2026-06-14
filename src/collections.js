export const COLLECTION_RARITIES = [
  'Common',
  'Rare',
  'Epic',
  'Legendary',
  'Mythic',
];

export const COLLECTION_CATEGORIES = {
  pieceSet: 'piece-set',
  boardTheme: 'board-theme',
  badge: 'badge',
  profileFrame: 'profile-frame',
  rushResultFrame: 'rush-result-frame',
  comboEffect: 'combo-effect',
};

export const PIECE_TYPES = [
  'Pawn',
  'Knight',
  'Bishop',
  'Rook',
  'Queen',
  'King',
];

export const CHEST_TYPES = [
  {
    id: 'basic-chest',
    name: 'Basic Chest',
    tier: 'Common',
    sources: ['Blitz Rush', 'Daily Rush streaks', 'early Ladder node clears'],
    intendedRewards: ['Common pieces', 'starter badges', 'small cosmetic progress'],
  },
  {
    id: 'tactical-chest',
    name: 'Tactical Chest',
    tier: 'Rare',
    sources: ['Blitz Rush', 'Classic Rush', 'higher rank results'],
    intendedRewards: ['Common pieces', 'Rare pieces', 'tactical badges'],
  },
  {
    id: 'royal-chest',
    name: 'Royal Chest',
    tier: 'Epic',
    sources: ['Classic Rush', 'Survival Rush', 'boss battle wins'],
    intendedRewards: ['Rare pieces', 'Epic pieces', 'Royal Set progress'],
  },
  {
    id: 'survival-chest',
    name: 'Survival Chest',
    tier: 'Epic',
    sources: ['Survival Rush', 'long-run milestones'],
    intendedRewards: ['Rare pieces', 'Epic pieces', 'Shadow Set progress'],
  },
  {
    id: 'legendary-chest',
    name: 'Legendary Chest',
    tier: 'Legendary',
    sources: ['high-rank Survival Rush', 'new best score bonuses', 'Grandmaster Keep milestones'],
    intendedRewards: ['Epic pieces', 'Legendary pieces', 'future Mythic cosmetics'],
  },
];

const PIECE_SET_CONFIGS = [
  {
    setId: 'classic-set',
    setName: 'Classic Set',
    rarity: 'Common',
    unlockSource: 'Ladder starter progression',
    cosmeticReward: 'Classic board trim',
  },
  {
    setId: 'bronze-set',
    setName: 'Bronze Set',
    rarity: 'Common',
    unlockSource: 'Pawn Village, Knight Woods, Basic Chests, and Tactical Chests',
    cosmeticReward: 'Bronze profile accent',
  },
  {
    setId: 'shadow-set',
    setName: 'Shadow Set',
    rarity: 'Rare',
    unlockSource: 'Knight Woods, Bishop Tower, Rook Fortress, Tactical Chests, and Survival Chests',
    cosmeticReward: 'Shadow result frame',
  },
  {
    setId: 'royal-set',
    setName: 'Royal Set',
    rarity: 'Epic',
    unlockSource: "Bishop Tower, Rook Fortress, Queen's Court, King's Gate, Royal Chests, and boss battle wins",
    cosmeticReward: 'Royal board theme',
  },
  {
    setId: 'grandmaster-set',
    setName: 'Grandmaster Set',
    rarity: 'Legendary',
    unlockSource: 'Grandmaster Keep boss rewards, Legendary Chests, and major zone completions',
    cosmeticReward: 'Grandmaster title and frame',
  },
];

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function buildPieceItem(setConfig, pieceType) {
  const pieceSlug = slugify(pieceType);
  const setSlug = setConfig.setId.replace(/-set$/, '');

  return {
    collectionItemId: `${setSlug}-${pieceSlug}`,
    category: COLLECTION_CATEGORIES.pieceSet,
    setId: setConfig.setId,
    setName: setConfig.setName,
    pieceType,
    rarity: setConfig.rarity,
    displayName: `${setConfig.setName.replace(' Set', '')} ${pieceType}`,
    unlockSource: setConfig.unlockSource,
    cosmeticReward: setConfig.cosmeticReward,
    owned: false,
    unlockedAt: null,
  };
}

export const PIECE_SETS = PIECE_SET_CONFIGS.map((setConfig) => ({
  ...setConfig,
  pieces: PIECE_TYPES.map((pieceType) => buildPieceItem(setConfig, pieceType)),
}));

export const COLLECTION_ITEMS = PIECE_SETS.flatMap((pieceSet) => pieceSet.pieces);
