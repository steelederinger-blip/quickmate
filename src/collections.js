export const COLLECTION_RARITIES = [
  'Common',
  'Rare',
  'Epic',
  'Legendary',
  'Mythic',
];

export const COLLECTION_CATEGORIES = {
  pieceSet: 'piece-set',
  pieceTheme: 'piece-theme',
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

export const PIECE_THEMES = [
  {
    id: 'classic',
    name: 'Classic',
    rarity: 'Common',
    unlockSource: 'Unlocked by default',
    description: 'Clean tournament-style pieces for maximum readability.',
    preview: 'Classic chess symbols',
    defaultUnlocked: true,
    requiredCollectionItems: [],
    requiredCompletedNodes: [],
  },
  {
    id: 'tournament',
    name: 'Tournament',
    rarity: 'Common',
    unlockSource: 'Defeat the Back Rank Guard or unlock Bronze Rook',
    description: 'Sharper contrast with a polished competition feel.',
    preview: 'Crisp weighted pieces',
    defaultUnlocked: false,
    requiredCollectionItems: ['bronze-rook'],
    requiredCompletedNodes: ['pawn-back-rank-guard'],
  },
  {
    id: 'marble',
    name: 'Marble',
    rarity: 'Rare',
    unlockSource: 'Complete Shadow Set progress or defeat The Diagonal Keeper',
    description: 'Stone-cut pieces with bright highlights and deep shadows.',
    preview: 'Carved marble finish',
    defaultUnlocked: false,
    requiredCollectionItems: ['shadow-bishop'],
    requiredCompletedNodes: ['bishop-diagonal-keeper'],
  },
  {
    id: 'shadow',
    name: 'Shadow',
    rarity: 'Epic',
    unlockSource: 'Defeat The Legendary Board',
    description: 'Dark premium pieces with electric edge highlights.',
    preview: 'Dark tactical glow',
    defaultUnlocked: false,
    requiredCollectionItems: [],
    requiredCompletedNodes: ['legendary-board'],
  },
  {
    id: 'royal',
    name: 'Royal',
    rarity: 'Epic',
    unlockSource: "Defeat The Queen's Trial or unlock Royal Queen",
    description: 'Gold-accented pieces for boss and campaign rewards.',
    preview: 'Royal gold accents',
    defaultUnlocked: false,
    requiredCollectionItems: ['royal-queen'],
    requiredCompletedNodes: ['queen-trial'],
  },
];

export const BOARD_THEMES = [
  {
    id: 'classic-green',
    name: 'Classic Green',
    rarity: 'Common',
    unlockSource: 'Unlocked by default',
    description: 'Readable green and parchment board colors.',
    preview: 'Tournament green',
    defaultUnlocked: true,
    lightSquare: '#e7d8bd',
    darkSquare: '#58745f',
    frameClassName: 'classic-green',
    requiredCollectionItems: [],
    requiredCompletedNodes: [],
  },
  {
    id: 'walnut',
    name: 'Walnut',
    rarity: 'Common',
    unlockSource: 'Defeat the Back Rank Guard or unlock Bronze Rook',
    description: 'Warm wood tones for early campaign rewards.',
    preview: 'Warm walnut board',
    defaultUnlocked: false,
    lightSquare: '#d7b98b',
    darkSquare: '#8b5a34',
    frameClassName: 'walnut',
    requiredCollectionItems: ['bronze-rook'],
    requiredCompletedNodes: ['pawn-back-rank-guard'],
  },
  {
    id: 'slate',
    name: 'Slate',
    rarity: 'Rare',
    unlockSource: 'Unlock Bronze Knight or clear Knight Woods',
    description: 'Cool tactical board with quiet contrast.',
    preview: 'Blue-gray slate board',
    defaultUnlocked: false,
    lightSquare: '#c8d3d9',
    darkSquare: '#526979',
    frameClassName: 'slate',
    requiredCollectionItems: ['bronze-knight'],
    requiredCompletedNodes: ['knight-smothered-king'],
  },
  {
    id: 'marble',
    name: 'Marble',
    rarity: 'Epic',
    unlockSource: 'Defeat The Legendary Board',
    description: 'Pale stone board with premium contrast.',
    preview: 'Polished marble board',
    defaultUnlocked: false,
    lightSquare: '#ece7dc',
    darkSquare: '#8e9296',
    frameClassName: 'marble',
    requiredCollectionItems: [],
    requiredCompletedNodes: ['legendary-board'],
  },
  {
    id: 'midnight',
    name: 'Midnight',
    rarity: 'Legendary',
    unlockSource: 'Defeat The Grandmaster Trial or unlock Grandmaster King',
    description: 'Dark arcade board with teal-gold edge energy.',
    preview: 'Premium midnight board',
    defaultUnlocked: false,
    lightSquare: '#95b7c4',
    darkSquare: '#243645',
    frameClassName: 'midnight',
    requiredCollectionItems: ['grandmaster-king'],
    requiredCompletedNodes: ['grandmaster-trial'],
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
