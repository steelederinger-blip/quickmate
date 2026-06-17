import { useEffect, useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import {
  BadgeCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Eye,
  HelpCircle,
  Home,
  Lightbulb,
  ListChecks,
  Play,
  RotateCcw,
  SkipForward,
  Sparkles,
  Target,
  Trophy,
  Zap,
  XCircle,
} from 'lucide-react';
import { CHEST_TYPES, COLLECTION_ITEMS, PIECE_SETS } from './collections.js';
import { puzzles } from './puzzles.js';

const STORAGE_KEY = 'quickmate.stats.v1';
const SKIP_PENALTY = 100;
const RUSH_SKIP_TIME_PENALTY = 5;
const RUSH_WRONG_MOVE_TIME_PENALTY = 3;
const RUSH_MAX_PUZZLE_ATTEMPTS = 2;
const DAILY_RUSH_PUZZLE_COUNT = 10;
const DAILY_RUSH_LIVES = 2;
const DAILY_RUSH_EPOCH = '2026-01-01';
const BRAND_TAGLINE = 'Fast chess puzzles. Daily Rush. Build your collection.';
const BRAND_LOGO_SRC = '/brand/quickmate-logo.png';
const ILLEGAL_MOVE_FEEDBACK = 'Illegal move.';
const WRONG_LEGAL_MOVE_FEEDBACK = 'Legal move, but it does not force mate.';
const RUSH_FIRST_MISS_FEEDBACK = 'Not forcing. One more try.';
const PUZZLE_BEHAVIOR = {
  trainingMode: 'trainingMode',
  strictMode: 'strictMode',
};

const RUSH_MODE_KEYS = {
  blitz: 'blitz',
  classic: 'classic',
  survival: 'survival',
  endless: 'endless',
  dailyRush: 'dailyRush',
};

const RUSH_MODES = {
  [RUSH_MODE_KEYS.blitz]: {
    key: RUSH_MODE_KEYS.blitz,
    label: 'Blitz Rush',
    shortLabel: 'Blitz',
    durationSeconds: 90,
    lives: 2,
    bestScoreKey: 'bestBlitzRushScore',
    mateInLabel: 'Mate in 1-3',
    description: '90 seconds, 2 lives, quick forcing mates.',
  },
  [RUSH_MODE_KEYS.classic]: {
    key: RUSH_MODE_KEYS.classic,
    label: 'Classic Rush',
    shortLabel: 'Classic',
    durationSeconds: 120,
    lives: 3,
    bestScoreKey: 'bestClassicRushScore',
    mateInLabel: 'Mate in 1-4',
    description: '120 seconds, 3 lives, balanced pressure.',
  },
  [RUSH_MODE_KEYS.survival]: {
    key: RUSH_MODE_KEYS.survival,
    label: 'Survival Rush',
    shortLabel: 'Survival',
    durationSeconds: null,
    lives: 3,
    bestScoreKey: 'bestSurvivalRushScore',
    mateInLabel: 'Progressive depth',
    description: '3 lives, no fixed countdown, deeper lines unlock as you solve.',
  },
  [RUSH_MODE_KEYS.endless]: {
    key: RUSH_MODE_KEYS.endless,
    label: 'Endless Survival',
    shortLabel: 'Endless',
    durationSeconds: null,
    lives: 1,
    bestScoreKey: 'bestEndlessScore',
    mateInLabel: 'Endless ramp',
    description: 'No clock. One wrong move or skip ends the run.',
  },
  [RUSH_MODE_KEYS.dailyRush]: {
    key: RUSH_MODE_KEYS.dailyRush,
    label: 'Daily Rush',
    shortLabel: 'Daily',
    durationSeconds: null,
    lives: DAILY_RUSH_LIVES,
    bestScoreKey: 'bestDailyRushScore',
    mateInLabel: '10 fixed puzzles',
    description: 'Daily 10-puzzle production-track sequence with 2 lives.',
  },
};

const RUSH_MODE_OPTIONS = [
  RUSH_MODES[RUSH_MODE_KEYS.blitz],
  RUSH_MODES[RUSH_MODE_KEYS.classic],
  RUSH_MODES[RUSH_MODE_KEYS.survival],
  RUSH_MODES[RUSH_MODE_KEYS.endless],
];

const LADDER_WORLD_ZONES = [
  {
    id: 'pawn-village',
    name: 'Pawn Village',
    campaignLabel: 'Starter Tactics',
    focus: 'First tactics, direct mates, and simple forcing moves.',
    mateInRange: 'Mate in 1',
    difficultyRange: 'Starter to Easy',
    motifs: ['back-rank basics', 'protected mates', 'promotion finish'],
    bossName: 'Back Rank Guard',
    rewardPreview: 'Basic/Tactical Chests, Bronze Rook, Back Rank Guard Badge, Ladder XP',
    unlocked: true,
    color: '#3f7a4f',
  },
  {
    id: 'knight-woods',
    name: 'Knight Woods',
    campaignLabel: 'Forks and First Threats',
    focus: 'Knight patterns, forks, smothered shapes, and unusual geometry.',
    mateInRange: 'Mate in 1-2',
    difficultyRange: 'Easy to Medium',
    motifs: ['knight-mate', 'smothered-mate', 'decoy traps'],
    bossName: 'The Smothered King',
    rewardPreview: 'Tactical/Royal Chests, Bronze Knight, Knight Woods Badge, Ladder XP',
    unlocked: false,
    color: '#4c6f9f',
  },
  {
    id: 'bishop-tower',
    name: 'Bishop Tower',
    campaignLabel: 'Diagonals and Pins',
    focus: 'Diagonal control, long-range coverage, and bishop mating nets.',
    mateInRange: 'Mate in 2-4',
    difficultyRange: 'Easy to Medium',
    motifs: ['bishop-diagonal', 'pinned defender', 'discovered-check'],
    bossName: 'The Diagonal Keeper',
    rewardPreview: 'Tactical/Royal Chests, Shadow Bishop, Bishop Tower Badge, Ladder XP',
    unlocked: false,
    color: '#7a5c9f',
  },
  {
    id: 'rook-fortress',
    name: 'Rook Fortress',
    campaignLabel: 'Files, Ranks, and Pressure',
    focus: 'Files, ranks, back-rank pressure, clearance, and rook lifts.',
    mateInRange: 'Mate in 2-4',
    difficultyRange: 'Medium to Advanced',
    motifs: ['rook-file', 'back-rank', 'overloaded defender'],
    bossName: 'The Fortress King',
    rewardPreview: 'Tactical/Royal Chests, Royal Rook, Rook Fortress Badge, Ladder XP',
    unlocked: false,
    color: '#8a6a2f',
  },
  {
    id: 'queens-court',
    name: "Queen's Court",
    campaignLabel: 'Attacks and Coordination',
    focus: 'Queen coordination, sacrifices, forcing checks, and attack conversion.',
    mateInRange: 'Mate in 3-5',
    difficultyRange: 'Medium to Advanced',
    motifs: ['queen-sacrifice', 'decoy', 'double-check'],
    bossName: "The Queen's Trial",
    rewardPreview: "Royal/Legendary Chests, Royal Queen, Queen's Court Badge, Ladder XP",
    unlocked: false,
    color: '#9a4f72',
  },
  {
    id: 'kings-gate',
    name: "King's Gate",
    campaignLabel: 'Defensive Precision',
    focus: 'Defensive resources, exact forcing lines, and boss-gate pressure.',
    mateInRange: 'Mate in 4-6',
    difficultyRange: 'Advanced to Expert',
    motifs: ['king-hunt', 'center-board-mate', 'forcing lines'],
    bossName: 'The Running King',
    rewardPreview: "Royal/Legendary Chests, Royal King, King's Gate Badge, Ladder XP",
    unlocked: false,
    color: '#7b4a32',
  },
  {
    id: 'grandmaster-keep',
    name: 'Grandmaster Keep',
    campaignLabel: 'Final Campaign Trial',
    focus: 'Deep mates, advanced tactics, long forcing lines, and survival-style pressure.',
    mateInRange: 'Mate in 4-8+',
    difficultyRange: 'Expert to Master',
    motifs: ['king-hunt', 'sacrifice', 'promotion'],
    bossName: 'The Grandmaster Trial',
    rewardPreview: 'Legendary Chests, Grandmaster King, Grandmaster Keep Badge, Ladder XP',
    unlocked: false,
    color: '#2e4968',
  },
];

const COMING_NEXT_WORLDS = [
  {
    name: 'Master Realm',
    label: 'Advanced Campaign Boards',
    preview: 'Future board with deeper tactical routes and premium cosmetic rewards.',
  },
  {
    name: 'International Master Citadel',
    label: 'Precision and Endurance',
    preview: 'Future world for longer forcing lines and boss-level defensive tests.',
  },
  {
    name: 'Grandmaster Summit',
    label: 'Elite Calculation',
    preview: 'Future climb for hard mates, rare badges, and collection milestones.',
  },
  {
    name: 'Legendary Hall',
    label: 'Legacy Challenges',
    preview: 'Future endgame destination for legendary boards and status rewards.',
  },
];

const PAWN_VILLAGE_ZONE_ID = 'pawn-village';
const PAWN_VILLAGE_BOSS_BADGE = 'Back Rank Guard Badge';
const PAWN_VILLAGE_BOSS_COLLECTION_REWARD_ID = 'bronze-rook';
const KNIGHT_WOODS_ZONE_ID = 'knight-woods';
const KNIGHT_WOODS_BOSS_BADGE = 'Knight Woods Badge';
const KNIGHT_WOODS_BOSS_COLLECTION_REWARD_ID = 'bronze-knight';
const BISHOP_TOWER_ZONE_ID = 'bishop-tower';
const BISHOP_TOWER_BOSS_BADGE = 'Bishop Tower Badge';
const BISHOP_TOWER_BOSS_COLLECTION_REWARD_ID = 'shadow-bishop';
const ROOK_FORTRESS_ZONE_ID = 'rook-fortress';
const ROOK_FORTRESS_BOSS_BADGE = 'Rook Fortress Badge';
const ROOK_FORTRESS_BOSS_COLLECTION_REWARD_ID = 'royal-rook';
const QUEENS_COURT_ZONE_ID = 'queens-court';
const QUEENS_COURT_BOSS_BADGE = "Queen's Court Badge";
const QUEENS_COURT_BOSS_COLLECTION_REWARD_ID = 'royal-queen';
const KINGS_GATE_ZONE_ID = 'kings-gate';
const KINGS_GATE_BOSS_BADGE = "King's Gate Badge";
const KINGS_GATE_BOSS_COLLECTION_REWARD_ID = 'royal-king';
const GRANDMASTER_KEEP_ZONE_ID = 'grandmaster-keep';
const GRANDMASTER_KEEP_BOSS_BADGE = 'Grandmaster Keep Badge';
const GRANDMASTER_KEEP_BOSS_COLLECTION_REWARD_ID = 'grandmaster-king';
const LADDER_ZONE_ACHIEVEMENT_IDS = {
  [PAWN_VILLAGE_ZONE_ID]: 'complete-pawn-village',
  [KNIGHT_WOODS_ZONE_ID]: 'complete-knight-woods',
  [BISHOP_TOWER_ZONE_ID]: 'complete-bishop-tower',
  [ROOK_FORTRESS_ZONE_ID]: 'complete-rook-fortress',
  [QUEENS_COURT_ZONE_ID]: 'complete-queens-court',
  [KINGS_GATE_ZONE_ID]: 'complete-kings-gate',
  [GRANDMASTER_KEEP_ZONE_ID]: 'complete-grandmaster-keep',
};
const PAWN_VILLAGE_NODES = [
  {
    id: 'pawn-welcome-mate',
    zoneId: PAWN_VILLAGE_ZONE_ID,
    type: 'normal',
    title: 'Welcome Mate',
    description: 'Start with direct mates and protected finishing moves.',
    puzzleCount: 3,
    clearRequirement: 2,
    rewardXp: 25,
    rewardChestTypeId: 'basic-chest',
    preferredMateInMin: 1,
    preferredMateInMax: 2,
    motifs: ['back-rank', 'corner-mate', 'rook-file'],
  },
  {
    id: 'pawn-back-rank-basics',
    zoneId: PAWN_VILLAGE_ZONE_ID,
    type: 'normal',
    title: 'Back Rank Basics',
    description: 'Spot simple back-rank nets before defenders escape.',
    puzzleCount: 3,
    clearRequirement: 2,
    rewardXp: 25,
    rewardChestTypeId: 'basic-chest',
    preferredMateInMin: 1,
    preferredMateInMax: 2,
    motifs: ['back-rank', 'rook-file', 'pinned-defender'],
  },
  {
    id: 'pawn-queen-rook-finish',
    zoneId: PAWN_VILLAGE_ZONE_ID,
    type: 'normal',
    title: 'Queen and Rook Finish',
    description: 'Convert clean queen and rook pressure into mate.',
    puzzleCount: 3,
    clearRequirement: 2,
    rewardXp: 25,
    rewardChestTypeId: 'tactical-chest',
    preferredMateInMin: 1,
    preferredMateInMax: 2,
    motifs: ['rook-file', 'queen-sacrifice', 'deflection'],
  },
  {
    id: 'pawn-no-hint-challenge',
    zoneId: PAWN_VILLAGE_ZONE_ID,
    type: 'normal',
    title: 'No-Hint Challenge',
    description: 'Clear two of three without using hints.',
    puzzleCount: 3,
    clearRequirement: 2,
    rewardXp: 25,
    rewardChestTypeId: 'tactical-chest',
    preferredMateInMin: 1,
    preferredMateInMax: 2,
    noHints: true,
    motifs: ['back-rank', 'bishop-diagonal', 'knight-mate'],
  },
  {
    id: 'pawn-back-rank-guard',
    zoneId: PAWN_VILLAGE_ZONE_ID,
    type: 'boss',
    title: 'Boss: Back Rank Guard',
    description: 'Defeat the guard by solving three of five before your lives run out.',
    puzzleCount: 5,
    clearRequirement: 3,
    lives: 3,
    rewardXp: 100,
    rewardBadge: PAWN_VILLAGE_BOSS_BADGE,
    rewardCollectionItemId: PAWN_VILLAGE_BOSS_COLLECTION_REWARD_ID,
    fallbackChestTypeId: 'royal-chest',
    preferredMateInMin: 1,
    preferredMateInMax: 2,
    motifs: ['back-rank', 'rook-file', 'deflection', 'pinned-defender'],
  },
];

const KNIGHT_WOODS_NODES = [
  {
    id: 'knight-fork-intro',
    zoneId: KNIGHT_WOODS_ZONE_ID,
    type: 'normal',
    title: 'Knight Fork Intro',
    description: 'Start the woods by spotting knight coverage and fork-like mating nets.',
    puzzleCount: 3,
    clearRequirement: 2,
    rewardXp: 35,
    rewardChestTypeId: 'tactical-chest',
    preferredMateInMin: 2,
    preferredMateInMax: 3,
    motifs: ['knight-mate', 'fork', 'decoy'],
  },
  {
    id: 'knight-smothered-trail',
    zoneId: KNIGHT_WOODS_ZONE_ID,
    type: 'normal',
    title: 'Smothered Mate Trail',
    description: 'Follow cramped-king positions where knight moves close the net.',
    puzzleCount: 3,
    clearRequirement: 2,
    rewardXp: 35,
    rewardChestTypeId: 'tactical-chest',
    preferredMateInMin: 2,
    preferredMateInMax: 3,
    motifs: ['smothered-mate', 'knight-mate', 'king-trap'],
  },
  {
    id: 'knight-forest-trap',
    zoneId: KNIGHT_WOODS_ZONE_ID,
    type: 'normal',
    title: 'Forest Trap',
    description: 'Use decoys, deflections, and discovered checks to keep the king boxed in.',
    puzzleCount: 3,
    clearRequirement: 2,
    rewardXp: 35,
    rewardChestTypeId: 'tactical-chest',
    preferredMateInMin: 2,
    preferredMateInMax: 3,
    motifs: ['king-trap', 'decoy', 'deflection', 'discovered-check'],
  },
  {
    id: 'knight-no-queen-challenge',
    zoneId: KNIGHT_WOODS_ZONE_ID,
    type: 'normal',
    title: 'No-Queen Challenge',
    description: 'Clear two of three while the queue avoids queen-led mating themes when possible.',
    puzzleCount: 3,
    clearRequirement: 2,
    rewardXp: 35,
    rewardChestTypeId: 'royal-chest',
    preferredMateInMin: 2,
    preferredMateInMax: 3,
    motifs: ['knight-mate', 'bishop-diagonal', 'rook-file', 'deflection'],
    excludedThemes: ['queen-mate', 'queen-sacrifice'],
  },
  {
    id: 'knight-smothered-king',
    zoneId: KNIGHT_WOODS_ZONE_ID,
    type: 'boss',
    title: 'Boss: The Smothered King',
    description: 'Defeat the king by solving three of five before your lives run out.',
    puzzleCount: 5,
    clearRequirement: 3,
    lives: 3,
    rewardXp: 125,
    rewardBadge: KNIGHT_WOODS_BOSS_BADGE,
    rewardCollectionItemId: KNIGHT_WOODS_BOSS_COLLECTION_REWARD_ID,
    fallbackChestTypeId: 'royal-chest',
    preferredMateInMin: 2,
    preferredMateInMax: 3,
    motifs: ['smothered-mate', 'knight-mate', 'king-trap', 'decoy', 'deflection'],
  },
];

const BISHOP_TOWER_NODES = [
  {
    id: 'bishop-diagonal-entry',
    zoneId: BISHOP_TOWER_ZONE_ID,
    type: 'normal',
    title: 'Diagonal Entry',
    description: 'Open the tower by finding bishop-led lines and diagonal mating coverage.',
    puzzleCount: 3,
    clearRequirement: 2,
    rewardXp: 45,
    rewardChestTypeId: 'tactical-chest',
    preferredMateInMin: 2,
    preferredMateInMax: 3,
    motifs: ['bishop-diagonal', 'diagonal-mate', 'decoy'],
  },
  {
    id: 'bishop-pin-defender',
    zoneId: BISHOP_TOWER_ZONE_ID,
    type: 'normal',
    title: 'Pin the Defender',
    description: 'Use pinned pieces and diagonal pressure to remove key defensive resources.',
    puzzleCount: 3,
    clearRequirement: 2,
    rewardXp: 45,
    rewardChestTypeId: 'tactical-chest',
    preferredMateInMin: 2,
    preferredMateInMax: 3,
    motifs: ['pin', 'pinned-defender', 'bishop-diagonal', 'deflection'],
  },
  {
    id: 'bishop-discovered-line',
    zoneId: BISHOP_TOWER_ZONE_ID,
    type: 'normal',
    title: 'Discovered Line',
    description: 'Calculate discovered checks and diagonal batteries before the king escapes.',
    puzzleCount: 3,
    clearRequirement: 2,
    rewardXp: 45,
    rewardChestTypeId: 'royal-chest',
    preferredMateInMin: 3,
    preferredMateInMax: 4,
    motifs: ['discovered-check', 'bishop-diagonal', 'queen-sacrifice', 'decoy'],
  },
  {
    id: 'bishop-clearance-path',
    zoneId: BISHOP_TOWER_ZONE_ID,
    type: 'normal',
    title: 'Clearance Path',
    description: 'Clear lanes, deflect guards, and keep long diagonals open for mate.',
    puzzleCount: 3,
    clearRequirement: 2,
    rewardXp: 45,
    rewardChestTypeId: 'royal-chest',
    preferredMateInMin: 3,
    preferredMateInMax: 4,
    motifs: ['clearance', 'bishop-diagonal', 'deflection', 'pinned-defender'],
  },
  {
    id: 'bishop-diagonal-keeper',
    zoneId: BISHOP_TOWER_ZONE_ID,
    type: 'boss',
    title: 'Boss: The Diagonal Keeper',
    description: 'Defeat the keeper by solving three of five diagonal tactics before your lives run out.',
    puzzleCount: 5,
    clearRequirement: 3,
    lives: 3,
    rewardXp: 150,
    rewardBadge: BISHOP_TOWER_BOSS_BADGE,
    rewardCollectionItemId: BISHOP_TOWER_BOSS_COLLECTION_REWARD_ID,
    fallbackChestTypeId: 'royal-chest',
    preferredMateInMin: 2,
    preferredMateInMax: 4,
    motifs: ['bishop-diagonal', 'diagonal-mate', 'discovered-check', 'pinned-defender', 'queen-sacrifice'],
  },
];

const ROOK_FORTRESS_NODES = [
  {
    id: 'rook-open-file',
    zoneId: ROOK_FORTRESS_ZONE_ID,
    type: 'normal',
    title: 'Open File',
    description: 'Enter the fortress by turning open files into forcing rook pressure.',
    puzzleCount: 3,
    clearRequirement: 2,
    rewardXp: 55,
    rewardChestTypeId: 'tactical-chest',
    preferredMateInMin: 2,
    preferredMateInMax: 3,
    motifs: ['rook-file', 'clearance', 'pinned-defender'],
  },
  {
    id: 'rook-back-rank-pressure',
    zoneId: ROOK_FORTRESS_ZONE_ID,
    type: 'normal',
    title: 'Back Rank Pressure',
    description: 'Use files, ranks, and trapped kings to convert back-rank threats.',
    puzzleCount: 3,
    clearRequirement: 2,
    rewardXp: 55,
    rewardChestTypeId: 'royal-chest',
    preferredMateInMin: 2,
    preferredMateInMax: 4,
    motifs: ['back-rank', 'rook-file', 'king-trap', 'deflection'],
  },
  {
    id: 'rook-overloaded-defender',
    zoneId: ROOK_FORTRESS_ZONE_ID,
    type: 'normal',
    title: 'Overloaded Defender',
    description: 'Break defenders that are covering too many rook-file and back-rank duties.',
    puzzleCount: 3,
    clearRequirement: 2,
    rewardXp: 55,
    rewardChestTypeId: 'royal-chest',
    preferredMateInMin: 2,
    preferredMateInMax: 4,
    motifs: ['overloaded-defender', 'deflection', 'rook-file', 'pinned-defender'],
  },
  {
    id: 'rook-sacrifice',
    zoneId: ROOK_FORTRESS_ZONE_ID,
    type: 'normal',
    title: 'Rook Sacrifice',
    description: 'Find decoys, sacrifices, and clearance moves that open the final file.',
    puzzleCount: 3,
    clearRequirement: 2,
    rewardXp: 55,
    rewardChestTypeId: 'royal-chest',
    preferredMateInMin: 3,
    preferredMateInMax: 4,
    motifs: ['sacrifice', 'decoy', 'rook-file', 'deflection'],
  },
  {
    id: 'rook-fortress-king',
    zoneId: ROOK_FORTRESS_ZONE_ID,
    type: 'boss',
    title: 'Boss: The Fortress King',
    description: 'Defeat the fortress by solving three of five rook-led tactics before your lives run out.',
    puzzleCount: 5,
    clearRequirement: 3,
    lives: 3,
    rewardXp: 175,
    rewardBadge: ROOK_FORTRESS_BOSS_BADGE,
    rewardCollectionItemId: ROOK_FORTRESS_BOSS_COLLECTION_REWARD_ID,
    fallbackChestTypeId: 'royal-chest',
    preferredMateInMin: 2,
    preferredMateInMax: 4,
    motifs: ['rook-file', 'back-rank', 'overloaded-defender', 'decoy', 'deflection'],
  },
];

const QUEENS_COURT_NODES = [
  {
    id: 'queen-royal-entry',
    zoneId: QUEENS_COURT_ZONE_ID,
    type: 'normal',
    title: 'Royal Entry',
    description: 'Enter the court with longer forcing lines built around queen coordination.',
    puzzleCount: 3,
    clearRequirement: 2,
    rewardXp: 70,
    rewardChestTypeId: 'royal-chest',
    preferredMateInMin: 3,
    preferredMateInMax: 5,
    motifs: ['queen-sacrifice', 'decoy', 'deflection', 'king-hunt'],
  },
  {
    id: 'queen-decoy-defender',
    zoneId: QUEENS_COURT_ZONE_ID,
    type: 'normal',
    title: 'Decoy the Defender',
    description: 'Drag defenders away from key squares before the forcing line lands.',
    puzzleCount: 3,
    clearRequirement: 2,
    rewardXp: 70,
    rewardChestTypeId: 'royal-chest',
    preferredMateInMin: 3,
    preferredMateInMax: 5,
    motifs: ['decoy', 'deflection', 'overloaded-defender', 'pinned-defender'],
  },
  {
    id: 'queen-sacrifice',
    zoneId: QUEENS_COURT_ZONE_ID,
    type: 'normal',
    title: 'Queen Sacrifice',
    description: 'Calculate queen sacrifices that force the king into a finished mating net.',
    puzzleCount: 3,
    clearRequirement: 2,
    rewardXp: 70,
    rewardChestTypeId: 'royal-chest',
    preferredMateInMin: 3,
    preferredMateInMax: 5,
    motifs: ['queen-sacrifice', 'deflection', 'king-hunt', 'clearance'],
  },
  {
    id: 'queen-double-check-court',
    zoneId: QUEENS_COURT_ZONE_ID,
    type: 'normal',
    title: 'Double Check Court',
    description: 'Handle double checks, discovered lines, and center-board mates under pressure.',
    puzzleCount: 3,
    clearRequirement: 2,
    rewardXp: 70,
    rewardChestTypeId: 'legendary-chest',
    preferredMateInMin: 3,
    preferredMateInMax: 5,
    motifs: ['double-check', 'discovered-check', 'center-board-mate', 'king-hunt'],
  },
  {
    id: 'queen-trial',
    zoneId: QUEENS_COURT_ZONE_ID,
    type: 'boss',
    title: "Boss: The Queen's Trial",
    description: 'Survive the court by solving three of five advanced queen-led forcing lines.',
    puzzleCount: 5,
    clearRequirement: 3,
    lives: 3,
    rewardXp: 225,
    rewardBadge: QUEENS_COURT_BOSS_BADGE,
    rewardCollectionItemId: QUEENS_COURT_BOSS_COLLECTION_REWARD_ID,
    fallbackChestTypeId: 'legendary-chest',
    preferredMateInMin: 3,
    preferredMateInMax: 5,
    motifs: ['queen-sacrifice', 'double-check', 'decoy', 'deflection', 'king-hunt'],
  },
];

const KINGS_GATE_NODES = [
  {
    id: 'king-open-board-hunt',
    zoneId: KINGS_GATE_ZONE_ID,
    type: 'normal',
    title: 'Open Board Hunt',
    description: 'Start the gate with open-board attacks and forcing king-hunt sequences.',
    puzzleCount: 3,
    clearRequirement: 2,
    rewardXp: 90,
    rewardChestTypeId: 'royal-chest',
    preferredMateInMin: 4,
    preferredMateInMax: 6,
    motifs: ['king-hunt', 'double-check', 'queen-sacrifice', 'bishop-diagonal'],
  },
  {
    id: 'king-center-king',
    zoneId: KINGS_GATE_ZONE_ID,
    type: 'normal',
    title: 'Center King',
    description: 'Force exposed kings through center-board mating nets.',
    puzzleCount: 3,
    clearRequirement: 2,
    rewardXp: 90,
    rewardChestTypeId: 'royal-chest',
    preferredMateInMin: 4,
    preferredMateInMax: 6,
    motifs: ['center-board-mate', 'king-hunt', 'rook-file', 'bishop-diagonal'],
  },
  {
    id: 'king-forced-march',
    zoneId: KINGS_GATE_ZONE_ID,
    type: 'normal',
    title: 'Forced March',
    description: 'Calculate longer forcing lines that march the king into a final net.',
    puzzleCount: 3,
    clearRequirement: 2,
    rewardXp: 90,
    rewardChestTypeId: 'legendary-chest',
    preferredMateInMin: 4,
    preferredMateInMax: 6,
    motifs: ['king-hunt', 'deflection', 'decoy', 'discovered-check', 'clearance'],
  },
  {
    id: 'king-gate-breaker',
    zoneId: KINGS_GATE_ZONE_ID,
    type: 'normal',
    title: 'Gate Breaker',
    description: 'Break the gate with sacrifices, clearance, and exact open-board checks.',
    puzzleCount: 3,
    clearRequirement: 2,
    rewardXp: 90,
    rewardChestTypeId: 'legendary-chest',
    preferredMateInMin: 4,
    preferredMateInMax: 6,
    motifs: ['sacrifice', 'queen-sacrifice', 'clearance', 'double-check', 'rook-file'],
  },
  {
    id: 'king-running-king',
    zoneId: KINGS_GATE_ZONE_ID,
    type: 'boss',
    title: 'Boss: The Running King',
    description: 'Stop the running king by solving three of five deep forcing lines.',
    puzzleCount: 5,
    clearRequirement: 3,
    lives: 3,
    rewardXp: 300,
    rewardBadge: KINGS_GATE_BOSS_BADGE,
    rewardCollectionItemId: KINGS_GATE_BOSS_COLLECTION_REWARD_ID,
    fallbackChestTypeId: 'legendary-chest',
    preferredMateInMin: 4,
    preferredMateInMax: 6,
    motifs: ['king-hunt', 'center-board-mate', 'double-check', 'deflection', 'decoy'],
  },
];

const GRANDMASTER_KEEP_NODES = [
  {
    id: 'grandmaster-master-entry',
    zoneId: GRANDMASTER_KEEP_ZONE_ID,
    type: 'normal',
    title: 'Master Entry',
    description: 'Enter the keep with advanced king hunts and exact forcing checks.',
    puzzleCount: 3,
    clearRequirement: 2,
    rewardXp: 125,
    rewardChestTypeId: 'legendary-chest',
    preferredMateInMin: 4,
    preferredMateInMax: 99,
    motifs: ['king-hunt', 'center-board-mate', 'double-check', 'bishop-diagonal'],
  },
  {
    id: 'grandmaster-deep-calculation',
    zoneId: GRANDMASTER_KEEP_ZONE_ID,
    type: 'normal',
    title: 'Deep Calculation',
    description: 'Calculate long forcing lines where every reply has to be accounted for.',
    puzzleCount: 3,
    clearRequirement: 2,
    rewardXp: 125,
    rewardChestTypeId: 'legendary-chest',
    preferredMateInMin: 4,
    preferredMateInMax: 99,
    motifs: ['discovered-check', 'clearance', 'deflection', 'overloaded-defender'],
  },
  {
    id: 'grandmaster-sacrifice-storm',
    zoneId: GRANDMASTER_KEEP_ZONE_ID,
    type: 'normal',
    title: 'Sacrifice Storm',
    description: 'Use sacrifices, queen decoys, and overloaded defenders to keep the attack forced.',
    puzzleCount: 3,
    clearRequirement: 2,
    rewardXp: 125,
    rewardChestTypeId: 'legendary-chest',
    preferredMateInMin: 4,
    preferredMateInMax: 99,
    motifs: ['sacrifice', 'queen-sacrifice', 'decoy', 'overloaded-defender', 'pinned-defender'],
  },
  {
    id: 'grandmaster-endgame-net',
    zoneId: GRANDMASTER_KEEP_ZONE_ID,
    type: 'normal',
    title: 'Endgame Net',
    description: 'Finish the campaign road with promotion threats, rook files, and clean mating nets.',
    puzzleCount: 3,
    clearRequirement: 2,
    rewardXp: 125,
    rewardChestTypeId: 'legendary-chest',
    preferredMateInMin: 4,
    preferredMateInMax: 99,
    motifs: ['promotion', 'rook-file', 'bishop-diagonal', 'center-board-mate', 'clearance'],
  },
  {
    id: 'grandmaster-trial',
    zoneId: GRANDMASTER_KEEP_ZONE_ID,
    type: 'boss',
    title: 'Boss: The Grandmaster Trial',
    description: 'Clear five of seven under pressure to finish the first QuickMate campaign.',
    puzzleCount: 7,
    clearRequirement: 5,
    lives: 3,
    rewardXp: 500,
    rewardBadge: GRANDMASTER_KEEP_BOSS_BADGE,
    rewardCollectionItemId: GRANDMASTER_KEEP_BOSS_COLLECTION_REWARD_ID,
    fallbackChestTypeId: 'legendary-chest',
    preferredMateInMin: 4,
    preferredMateInMax: 99,
    motifs: [
      'king-hunt',
      'center-board-mate',
      'double-check',
      'discovered-check',
      'sacrifice',
      'promotion',
      'deflection',
    ],
  },
];

const LADDER_ZONE_NODES = {
  [PAWN_VILLAGE_ZONE_ID]: PAWN_VILLAGE_NODES,
  [KNIGHT_WOODS_ZONE_ID]: KNIGHT_WOODS_NODES,
  [BISHOP_TOWER_ZONE_ID]: BISHOP_TOWER_NODES,
  [ROOK_FORTRESS_ZONE_ID]: ROOK_FORTRESS_NODES,
  [QUEENS_COURT_ZONE_ID]: QUEENS_COURT_NODES,
  [KINGS_GATE_ZONE_ID]: KINGS_GATE_NODES,
  [GRANDMASTER_KEEP_ZONE_ID]: GRANDMASTER_KEEP_NODES,
};

const PLAYABLE_LADDER_ZONE_IDS = [
  PAWN_VILLAGE_ZONE_ID,
  KNIGHT_WOODS_ZONE_ID,
  BISHOP_TOWER_ZONE_ID,
  ROOK_FORTRESS_ZONE_ID,
  QUEENS_COURT_ZONE_ID,
  KINGS_GATE_ZONE_ID,
  GRANDMASTER_KEEP_ZONE_ID,
];

const LADDER_CONTENT_SECTION_ORDER = ['candidate', 'dev'];
const LADDER_MATE_GROUPS = [
  { key: '1', label: 'Mate in 1' },
  { key: '2', label: 'Mate in 2' },
  { key: '3', label: 'Mate in 3' },
  { key: '4', label: 'Mate in 4' },
  { key: '5-plus', label: 'Mate in 5+' },
];

function getLadderMateGroupKey(mateIn) {
  return mateIn >= 5 ? '5-plus' : String(mateIn);
}

const DEFAULT_COLLECTION_STATS = {
  totalPiecesOwned: 0,
  piecesUnlocked: 0,
  setsCompleted: 0,
  unopenedChests: 0,
  chestsOpened: 0,
};

const RUSH_MILESTONE_CHESTS = [
  {
    id: 'rush-runs-5',
    runs: 5,
    chestTypeId: 'basic-chest',
    label: '5 completed Rush runs',
  },
  {
    id: 'rush-runs-25',
    runs: 25,
    chestTypeId: 'tactical-chest',
    label: '25 completed Rush runs',
  },
  {
    id: 'rush-runs-100',
    runs: 100,
    chestTypeId: 'royal-chest',
    label: '100 completed Rush runs',
  },
];

const DEFAULT_STATS = {
  puzzlesSolved: 0,
  perfectSolves: 0,
  bestScore: 0,
  bestRushScore: 0,
  bestBlitzRushScore: 0,
  bestClassicRushScore: 0,
  bestSurvivalRushScore: 0,
  bestEndlessScore: 0,
  bestEndlessDepth: 0,
  bestEndlessStreak: 0,
  totalEndlessRuns: 0,
  bestDailyRushScore: 0,
  bestRushCombo: 0,
  rushGamesPlayed: 0,
  perfectRushRuns: 0,
  rushMilestoneChestsAwarded: [],
  unlockedAchievements: [],
  rushHistory: [],
  bestTimeByPuzzleId: {},
  puzzleCompletions: {},
  completedDailyPuzzleDate: '',
  currentDailyStreak: 0,
  dailyRushDate: '',
  dailyRushOfficialResult: null,
  dailyRushStreak: 0,
  completedLadderNodes: [],
  currentZone: PAWN_VILLAGE_ZONE_ID,
  ladderXp: 0,
  ladderBadges: [],
  ownedCollectionItems: [],
  unopenedChests: [],
  collectionStats: DEFAULT_COLLECTION_STATS,
};

const DEFAULT_RUSH_STATS = {
  solved: 0,
  perfectSolves: 0,
  mistakes: 0,
  misses: 0,
  skips: 0,
  totalScore: 0,
  currentCombo: 0,
  bestCombo: 0,
  totalSolveSeconds: 0,
};

const DEFAULT_LADDER_NODE_STATS = {
  solved: 0,
  misses: 0,
  mistakes: 0,
};

const RUSH_CHEST_SCORE_THRESHOLDS = {
  [RUSH_MODE_KEYS.blitz]: {
    common: 1800,
    rare: 3200,
    epic: 5200,
  },
  [RUSH_MODE_KEYS.classic]: {
    common: 1500,
    rare: 2800,
    epic: 4800,
  },
  [RUSH_MODE_KEYS.survival]: {
    common: 1800,
    rare: 3400,
    epic: 6200,
  },
  [RUSH_MODE_KEYS.endless]: {
    common: 8,
    rare: 18,
    epic: 35,
  },
};

const RUSH_CHEST_RULES = {
  [RUSH_MODE_KEYS.blitz]: [
    {
      chestTypeId: 'royal-chest',
      minScore: RUSH_CHEST_SCORE_THRESHOLDS[RUSH_MODE_KEYS.blitz].epic,
      minSolved: 7,
      minPerfectSolves: 6,
      minBestCombo: 5,
      maxMistakes: 1,
      maxSkips: 0,
      reason: 'Elite Blitz Rush',
    },
    {
      chestTypeId: 'tactical-chest',
      minScore: RUSH_CHEST_SCORE_THRESHOLDS[RUSH_MODE_KEYS.blitz].rare,
      minSolved: 5,
      minBestCombo: 3,
      maxSkips: 1,
      reason: 'Strong Blitz Rush',
    },
    {
      chestTypeId: 'basic-chest',
      minScore: RUSH_CHEST_SCORE_THRESHOLDS[RUSH_MODE_KEYS.blitz].common,
      minSolved: 3,
      minBestCombo: 2,
      reason: 'Solid Blitz Rush',
    },
  ],
  [RUSH_MODE_KEYS.classic]: [
    {
      chestTypeId: 'royal-chest',
      minScore: RUSH_CHEST_SCORE_THRESHOLDS[RUSH_MODE_KEYS.classic].epic,
      minSolved: 7,
      minPerfectSolves: 5,
      minBestCombo: 5,
      maxSkips: 1,
      reason: 'Elite Classic Rush',
    },
    {
      chestTypeId: 'tactical-chest',
      minScore: RUSH_CHEST_SCORE_THRESHOLDS[RUSH_MODE_KEYS.classic].rare,
      minSolved: 4,
      minBestCombo: 3,
      reason: 'Strong Classic Rush',
    },
    {
      chestTypeId: 'basic-chest',
      minScore: RUSH_CHEST_SCORE_THRESHOLDS[RUSH_MODE_KEYS.classic].common,
      minSolved: 3,
      reason: 'Solid Classic Rush',
    },
  ],
  [RUSH_MODE_KEYS.survival]: [
    {
      chestTypeId: 'survival-chest',
      minScore: RUSH_CHEST_SCORE_THRESHOLDS[RUSH_MODE_KEYS.survival].epic,
      minSolved: 9,
      minPerfectSolves: 6,
      minBestCombo: 5,
      minAccuracy: 0.75,
      reason: 'Deep Survival Rush',
    },
    {
      chestTypeId: 'tactical-chest',
      minScore: RUSH_CHEST_SCORE_THRESHOLDS[RUSH_MODE_KEYS.survival].rare,
      minSolved: 6,
      minAccuracy: 0.65,
      reason: 'Strong Survival Rush',
    },
    {
      chestTypeId: 'basic-chest',
      minScore: RUSH_CHEST_SCORE_THRESHOLDS[RUSH_MODE_KEYS.survival].common,
      minSolved: 4,
      minAccuracy: 0.5,
      reason: 'Solid Survival Rush',
    },
  ],
  [RUSH_MODE_KEYS.endless]: [
    {
      chestTypeId: 'royal-chest',
      minScore: 0,
      minSolved: RUSH_CHEST_SCORE_THRESHOLDS[RUSH_MODE_KEYS.endless].epic,
      reason: 'Endless depth 35',
    },
    {
      chestTypeId: 'tactical-chest',
      minScore: 0,
      minSolved: RUSH_CHEST_SCORE_THRESHOLDS[RUSH_MODE_KEYS.endless].rare,
      reason: 'Endless depth 18',
    },
    {
      chestTypeId: 'basic-chest',
      minScore: 0,
      minSolved: RUSH_CHEST_SCORE_THRESHOLDS[RUSH_MODE_KEYS.endless].common,
      reason: 'Endless depth 8',
    },
  ],
};

const RUSH_RANKS = [
  { rank: 'Warmup', minScore: 0 },
  { rank: 'Tactician', minScore: 1000 },
  { rank: 'Attacker', minScore: 2500 },
  { rank: 'Closer', minScore: 5000 },
  { rank: 'Checkmate Machine', minScore: 7500 },
  { rank: 'QuickMate Master', minScore: 10000 },
];

const ACHIEVEMENTS = [
  {
    id: 'first-rush-completed',
    name: 'First Rush Completed',
    description: 'Finish any Blitz, Classic, Survival, or Endless Rush run.',
    isUnlocked: (stats) => (stats.rushGamesPlayed || 0) >= 1,
  },
  {
    id: 'rush-runs-10',
    name: '10 Rush Runs',
    description: 'Complete 10 Rush runs.',
    isUnlocked: (stats) => (stats.rushGamesPlayed || 0) >= 10,
  },
  {
    id: 'rush-runs-25',
    name: '25 Rush Runs',
    description: 'Complete 25 Rush runs.',
    isUnlocked: (stats) => (stats.rushGamesPlayed || 0) >= 25,
  },
  {
    id: 'first-perfect-rush',
    name: 'First Perfect Rush',
    description: 'Finish a Rush run with no misses, skips, or wrong legal moves.',
    isUnlocked: (stats) => (stats.perfectRushRuns || 0) >= 1,
  },
  {
    id: 'first-daily-rush',
    name: 'First Daily Rush',
    description: 'Complete an official Daily Rush.',
    isUnlocked: (stats) => Boolean(stats.dailyRushDate),
  },
  {
    id: 'daily-rush-streak-3',
    name: '3-Day Daily Rush Streak',
    description: 'Complete official Daily Rush on three consecutive days.',
    isUnlocked: (stats) => (stats.dailyRushStreak || 0) >= 3,
  },
  {
    id: 'first-ladder-world-completed',
    name: 'First Ladder World Completed',
    description: 'Clear the first QuickMate campaign.',
    isUnlocked: (stats) => normalizeStringArray(stats.completedLadderNodes).includes('grandmaster-trial'),
  },
  {
    id: 'complete-pawn-village',
    name: 'Complete Pawn Village',
    description: 'Defeat the Back Rank Guard.',
    isUnlocked: (stats) => normalizeStringArray(stats.completedLadderNodes).includes('pawn-back-rank-guard'),
  },
  {
    id: 'complete-knight-woods',
    name: 'Complete Knight Woods',
    description: 'Defeat The Smothered King.',
    isUnlocked: (stats) => normalizeStringArray(stats.completedLadderNodes).includes('knight-smothered-king'),
  },
  {
    id: 'complete-bishop-tower',
    name: 'Complete Bishop Tower',
    description: 'Defeat The Diagonal Keeper.',
    isUnlocked: (stats) => normalizeStringArray(stats.completedLadderNodes).includes('bishop-diagonal-keeper'),
  },
  {
    id: 'complete-rook-fortress',
    name: 'Complete Rook Fortress',
    description: 'Defeat The Fortress King.',
    isUnlocked: (stats) => normalizeStringArray(stats.completedLadderNodes).includes('rook-fortress-king'),
  },
  {
    id: 'complete-queens-court',
    name: "Complete Queen's Court",
    description: "Defeat The Queen's Trial.",
    isUnlocked: (stats) => normalizeStringArray(stats.completedLadderNodes).includes('queen-trial'),
  },
  {
    id: 'complete-kings-gate',
    name: "Complete King's Gate",
    description: 'Defeat The Running King.',
    isUnlocked: (stats) => normalizeStringArray(stats.completedLadderNodes).includes('king-running-king'),
  },
  {
    id: 'complete-grandmaster-keep',
    name: 'Complete Grandmaster Keep',
    description: 'Defeat The Grandmaster Trial.',
    isUnlocked: (stats) => normalizeStringArray(stats.completedLadderNodes).includes('grandmaster-trial'),
  },
  {
    id: 'first-chest-opened',
    name: 'First Chest Opened',
    description: 'Open any reward chest.',
    isUnlocked: (stats) => (stats.collectionStats?.chestsOpened || 0) >= 1,
  },
  {
    id: 'first-collection-piece',
    name: 'First Collection Piece Unlocked',
    description: 'Unlock your first collectible chess piece.',
    isUnlocked: (stats) => normalizeOwnedCollectionItems(stats.ownedCollectionItems).length >= 1,
  },
  {
    id: 'first-endless-run',
    name: 'First Endless Run',
    description: 'Finish one Endless Survival run.',
    isUnlocked: (stats) => (stats.totalEndlessRuns || 0) >= 1,
  },
  {
    id: 'endless-depth-10',
    name: 'Reach Endless Depth 10',
    description: 'Solve 10 puzzles in one Endless Survival run.',
    isUnlocked: (stats) => (stats.bestEndlessDepth || 0) >= 10,
  },
  {
    id: 'endless-depth-25',
    name: 'Reach Endless Depth 25',
    description: 'Solve 25 puzzles in one Endless Survival run.',
    isUnlocked: (stats) => (stats.bestEndlessDepth || 0) >= 25,
  },
  {
    id: 'endless-depth-50',
    name: 'Reach Endless Depth 50',
    description: 'Solve 50 puzzles in one Endless Survival run.',
    isUnlocked: (stats) => (stats.bestEndlessDepth || 0) >= 50,
  },
];

const RUSH_MULTIPLIER_THRESHOLDS = [
  { combo: 2, multiplier: 1.25 },
  { combo: 3, multiplier: 1.5 },
  { combo: 5, multiplier: 2 },
  { combo: 8, multiplier: 2.5 },
];

const ENDLESS_MULTIPLIER_THRESHOLDS = [
  { streak: 5, multiplier: 1.5 },
  { streak: 10, multiplier: 2 },
  { streak: 20, multiplier: 2.5 },
  { streak: 30, multiplier: 3 },
];

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getYesterdayKey(todayKey) {
  const [year, month, day] = todayKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  return getTodayKey(date);
}

function puzzleFitsMode(puzzle, targetMode) {
  return !Array.isArray(puzzle.modeFit) || puzzle.modeFit.includes(targetMode);
}

function isProductionTrackPuzzle(puzzle) {
  return puzzle.contentStatus === 'candidate' || puzzle.contentStatus === 'approved';
}

function getPuzzleIndexesForMode(targetMode, { productionTrackOnly = false, devOnly = false } = {}) {
  return puzzles
    .map((puzzle, index) => ({ puzzle, index }))
    .filter(({ puzzle }) => puzzleFitsMode(puzzle, targetMode))
    .filter(({ puzzle }) => {
      if (productionTrackOnly) {
        return isProductionTrackPuzzle(puzzle);
      }

      if (devOnly) {
        return puzzle.contentStatus === 'dev';
      }

      return puzzle.contentStatus !== 'rejected';
    })
    .map(({ index }) => index);
}

function getDailyPuzzleIndex(dateKey = getTodayKey()) {
  const hash = [...dateKey].reduce((total, char) => total + char.charCodeAt(0), 0);
  const productionDailyIndexes = puzzles
    .map((puzzle, index) => ({ puzzle, index }))
    .filter(({ puzzle }) => isProductionTrackPuzzle(puzzle) && puzzle.contentStatus !== 'rejected')
    .map(({ index }) => index);
  const devDailyIndexes = getPuzzleIndexesForMode('daily', { devOnly: true });
  const dailyIndexes = productionDailyIndexes.length > 0 ? productionDailyIndexes : devDailyIndexes;

  return dailyIndexes[hash % dailyIndexes.length] ?? hash % puzzles.length;
}

function hashString(value) {
  return [...String(value)].reduce((hash, char) => {
    return Math.imul(hash ^ char.charCodeAt(0), 16777619);
  }, 2166136261) >>> 0;
}

function createSeededRandom(seedValue) {
  let seed = hashString(seedValue);

  return () => {
    seed = (seed + 0x6D2B79F5) >>> 0;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(values) {
  return [...values].sort(() => Math.random() - 0.5);
}

function shuffleSeeded(values, seedValue) {
  const random = createSeededRandom(seedValue);
  const shuffled = [...values];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const targetIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[targetIndex]] = [shuffled[targetIndex], shuffled[index]];
  }

  return shuffled;
}

function getDailyRushNumber(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const [epochYear, epochMonth, epochDay] = DAILY_RUSH_EPOCH.split('-').map(Number);
  const dateValue = Date.UTC(year, month - 1, day);
  const epochValue = Date.UTC(epochYear, epochMonth - 1, epochDay);

  return Math.max(1, Math.floor((dateValue - epochValue) / 86400000) + 1);
}

function puzzleFitsAnyMode(puzzle, targetModes) {
  return targetModes.some((targetMode) => puzzleFitsMode(puzzle, targetMode));
}

function getDailyRushMateInRange(slotIndex) {
  if (slotIndex <= 2) {
    return { min: 1, max: 1 };
  }

  if (slotIndex <= 6) {
    return { min: 1, max: 2 };
  }

  return { min: 2, max: 3 };
}

function getDailyRushEligiblePuzzleIndexes() {
  return puzzles
    .map((puzzle, index) => ({ puzzle, index }))
    .filter(({ puzzle }) => isProductionTrackPuzzle(puzzle))
    .filter(({ puzzle }) => puzzleFitsAnyMode(puzzle, ['rush', 'blitz', 'classic', 'survival']))
    .map(({ index }) => index);
}

function buildDailyRushSequence(dateKey = getTodayKey()) {
  const productionIndexes = getDailyRushEligiblePuzzleIndexes();

  if (productionIndexes.length === 0) {
    return [];
  }

  const seededIndexes = shuffleSeeded(productionIndexes, `daily-rush:${dateKey}`);
  const selectedIndexes = [];

  for (let slotIndex = 0; slotIndex < DAILY_RUSH_PUZZLE_COUNT; slotIndex += 1) {
    const mateInRange = getDailyRushMateInRange(slotIndex);
    const preferredIndexes = seededIndexes.filter((index) => {
      return puzzles[index].mateIn >= mateInRange.min && puzzles[index].mateIn <= mateInRange.max;
    });
    const fallbackIndexes = seededIndexes.filter((index) => puzzles[index].mateIn <= mateInRange.max);
    const sourcePool = preferredIndexes.length > 0
      ? preferredIndexes
      : fallbackIndexes.length > 0
        ? fallbackIndexes
        : seededIndexes;
    const unusedPool = sourcePool.filter((index) => !selectedIndexes.includes(index));
    const finalPool = unusedPool.length > 0 ? unusedPool : sourcePool;
    const pickSeed = hashString(`${dateKey}:${slotIndex}:${mateInRange.min}-${mateInRange.max}`);

    selectedIndexes.push(finalPool[pickSeed % finalPool.length]);
  }

  return selectedIndexes;
}

function getLadderZoneById(zoneId) {
  return LADDER_WORLD_ZONES.find((zone) => zone.id === zoneId) || LADDER_WORLD_ZONES[0];
}

function getLadderZoneNodes(zoneId) {
  return LADDER_ZONE_NODES[zoneId] || [];
}

function getAllLadderNodes() {
  return Object.values(LADDER_ZONE_NODES).flat();
}

function getLadderNodeById(nodeId) {
  return getAllLadderNodes().find((node) => node.id === nodeId) || PAWN_VILLAGE_NODES[0];
}

function getLadderZoneScreen(zoneId) {
  if (zoneId === GRANDMASTER_KEEP_ZONE_ID) {
    return 'grandmasterKeep';
  }

  if (zoneId === KINGS_GATE_ZONE_ID) {
    return 'kingsGate';
  }

  if (zoneId === QUEENS_COURT_ZONE_ID) {
    return 'queensCourt';
  }

  if (zoneId === ROOK_FORTRESS_ZONE_ID) {
    return 'rookFortress';
  }

  if (zoneId === BISHOP_TOWER_ZONE_ID) {
    return 'bishopTower';
  }

  if (zoneId === KNIGHT_WOODS_ZONE_ID) {
    return 'knightWoods';
  }

  return 'pawnVillage';
}

function getNextLadderZone(zoneId) {
  const zoneIndex = LADDER_WORLD_ZONES.findIndex((zone) => zone.id === zoneId);

  return zoneIndex >= 0 ? LADDER_WORLD_ZONES[zoneIndex + 1] || null : null;
}

function getLadderZoneBadge(zoneId) {
  if (zoneId === PAWN_VILLAGE_ZONE_ID) {
    return PAWN_VILLAGE_BOSS_BADGE;
  }

  if (zoneId === KNIGHT_WOODS_ZONE_ID) {
    return KNIGHT_WOODS_BOSS_BADGE;
  }

  if (zoneId === BISHOP_TOWER_ZONE_ID) {
    return BISHOP_TOWER_BOSS_BADGE;
  }

  if (zoneId === ROOK_FORTRESS_ZONE_ID) {
    return ROOK_FORTRESS_BOSS_BADGE;
  }

  if (zoneId === QUEENS_COURT_ZONE_ID) {
    return QUEENS_COURT_BOSS_BADGE;
  }

  if (zoneId === KINGS_GATE_ZONE_ID) {
    return KINGS_GATE_BOSS_BADGE;
  }

  if (zoneId === GRANDMASTER_KEEP_ZONE_ID) {
    return GRANDMASTER_KEEP_BOSS_BADGE;
  }

  return '';
}

function getProductionTrackLadderPuzzleIndexes() {
  return puzzles
    .map((puzzle, index) => ({ puzzle, index }))
    .filter(({ puzzle }) => isProductionTrackPuzzle(puzzle))
    .filter(({ puzzle }) => puzzleFitsAnyMode(puzzle, ['ladder', 'rush', 'blitz', 'classic', 'survival']))
    .map(({ index }) => index);
}

function puzzleMatchesNodeMotif(puzzle, node) {
  const puzzleThemes = getPuzzleThemes(puzzle);

  if (!Array.isArray(node.motifs) || node.motifs.length === 0 || puzzleThemes.length === 0) {
    return false;
  }

  return node.motifs.some((motif) => puzzleThemes.includes(motif));
}

function puzzleAvoidsExcludedNodeThemes(puzzle, node) {
  const excludedThemes = Array.isArray(node.excludedThemes) ? node.excludedThemes : [];

  if (excludedThemes.length === 0) {
    return true;
  }

  const puzzleThemes = getPuzzleThemes(puzzle);

  return excludedThemes.every((theme) => !puzzleThemes.includes(theme));
}

function buildLadderNodeQueue(nodeId) {
  const node = getLadderNodeById(nodeId);
  const productionIndexes = getProductionTrackLadderPuzzleIndexes();
  const themeFilteredIndexes = productionIndexes.filter((index) => puzzleAvoidsExcludedNodeThemes(puzzles[index], node));
  const eligibleIndexes = themeFilteredIndexes.length > 0 ? themeFilteredIndexes : productionIndexes;
  const preferredMateInMin = node.preferredMateInMin || 1;
  const preferredMateInMax = node.preferredMateInMax || 2;
  const mateInPreferredIndexes = eligibleIndexes.filter((index) => {
    return puzzles[index].mateIn >= preferredMateInMin && puzzles[index].mateIn <= preferredMateInMax;
  });
  const motifPreferredIndexes = mateInPreferredIndexes.filter((index) => puzzleMatchesNodeMotif(puzzles[index], node));
  const fallbackMateInIndexes = mateInPreferredIndexes.filter((index) => !motifPreferredIndexes.includes(index));
  const fallbackEligibleIndexes = eligibleIndexes.filter((index) => !mateInPreferredIndexes.includes(index));
  const sourceIndexes = [
    ...shuffleSeeded(motifPreferredIndexes, `${node.zoneId}:${node.id}:motif`),
    ...shuffleSeeded(fallbackMateInIndexes, `${node.zoneId}:${node.id}:mate`),
    ...shuffleSeeded(fallbackEligibleIndexes, `${node.zoneId}:${node.id}:fallback`),
  ].filter((index, arrayIndex, array) => array.indexOf(index) === arrayIndex);
  const selectedIndexes = [];

  for (let index = 0; index < node.puzzleCount; index += 1) {
    const unusedIndexes = sourceIndexes.filter((puzzleIndex) => !selectedIndexes.includes(puzzleIndex));
    const finalPool = unusedIndexes.length > 0 ? unusedIndexes : sourceIndexes;

    if (finalPool.length === 0) {
      return selectedIndexes;
    }

    selectedIndexes.push(finalPool[index % finalPool.length]);
  }

  return selectedIndexes;
}

function getLadderZoneProgress(zoneId, completedNodeIds = []) {
  const zoneNodes = getLadderZoneNodes(zoneId);
  const completedSet = new Set(completedNodeIds);
  const completedCount = zoneNodes.filter((node) => completedSet.has(node.id)).length;

  return {
    completedCount,
    totalCount: zoneNodes.length,
    isComplete: zoneNodes.length > 0 && completedCount >= zoneNodes.length,
  };
}

function getLadderCampaignProgress(completedNodeIds = []) {
  const zoneProgress = LADDER_WORLD_ZONES.map((zone) => ({
    zone,
    progress: getLadderZoneProgress(zone.id, completedNodeIds),
  }));
  const completedNodes = zoneProgress.reduce((total, item) => total + item.progress.completedCount, 0);
  const totalNodes = zoneProgress.reduce((total, item) => total + item.progress.totalCount, 0);
  const worldsCompleted = zoneProgress.filter((item) => item.progress.isComplete).length;

  return {
    completedNodes,
    totalNodes,
    worldsCompleted,
    totalWorlds: LADDER_WORLD_ZONES.length,
    percent: totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0,
  };
}

function getCurrentLadderCampaignZone(completedNodeIds = []) {
  const currentZone = LADDER_WORLD_ZONES.find((zone) => {
    const progress = getLadderZoneProgress(zone.id, completedNodeIds);
    return ladderZoneIsUnlocked(zone.id, completedNodeIds) && !progress.isComplete;
  });

  return currentZone || LADDER_WORLD_ZONES[LADDER_WORLD_ZONES.length - 1];
}

function getLadderZoneAchievementId(zoneId) {
  return LADDER_ZONE_ACHIEVEMENT_IDS[zoneId] || '';
}

function ladderZoneIsUnlocked(zoneId, completedNodeIds = []) {
  const completedSet = new Set(completedNodeIds);

  if (zoneId === PAWN_VILLAGE_ZONE_ID) {
    return true;
  }

  if (zoneId === KNIGHT_WOODS_ZONE_ID) {
    return completedSet.has('pawn-back-rank-guard');
  }

  if (zoneId === BISHOP_TOWER_ZONE_ID) {
    return completedSet.has('knight-smothered-king');
  }

  if (zoneId === ROOK_FORTRESS_ZONE_ID) {
    return completedSet.has('bishop-diagonal-keeper');
  }

  if (zoneId === QUEENS_COURT_ZONE_ID) {
    return completedSet.has('rook-fortress-king');
  }

  if (zoneId === KINGS_GATE_ZONE_ID) {
    return completedSet.has('queen-trial');
  }

  if (zoneId === GRANDMASTER_KEEP_ZONE_ID) {
    return completedSet.has('king-running-king');
  }

  return false;
}

function ladderNodeIsUnlocked(nodeId, completedNodeIds = []) {
  const node = getLadderNodeById(nodeId);
  const zoneNodes = getLadderZoneNodes(node.zoneId);
  const nodeIndex = zoneNodes.findIndex((zoneNode) => zoneNode.id === nodeId);
  const completedSet = new Set(completedNodeIds);

  if (!ladderZoneIsUnlocked(node.zoneId, completedNodeIds)) {
    return false;
  }

  if (nodeIndex <= 0) {
    return true;
  }

  return completedSet.has(zoneNodes[nodeIndex - 1].id);
}

function getRushModeConfig(rushModeKey) {
  return RUSH_MODES[rushModeKey] || RUSH_MODES[RUSH_MODE_KEYS.classic];
}

function rushModeIsTimed(rushModeKey) {
  return getRushModeConfig(rushModeKey).durationSeconds !== null;
}

function getRushMateInLimit(solvedCount, rushModeKey) {
  if (rushModeKey === RUSH_MODE_KEYS.blitz) {
    return 3;
  }

  if (rushModeKey === RUSH_MODE_KEYS.classic) {
    return 4;
  }

  if (solvedCount <= 2) {
    return 1;
  }

  if (solvedCount <= 6) {
    return 2;
  }

  if (solvedCount <= 11) {
    return 3;
  }

  if (solvedCount <= 17) {
    return 4;
  }

  return Infinity;
}

function getEndlessDepthBand(solvedCount) {
  const depth = solvedCount + 1;

  if (depth <= 5) {
    return {
      label: 'Opening climb',
      minMateIn: 1,
      maxMateIn: 1,
      maxRating: 1050,
      difficulties: ['starter', 'easy'],
    };
  }

  if (depth <= 15) {
    return {
      label: 'Middle climb',
      minMateIn: 1,
      maxMateIn: 2,
      maxRating: 1350,
      difficulties: ['easy', 'medium'],
    };
  }

  if (depth <= 30) {
    return {
      label: 'Hard climb',
      minMateIn: 2,
      maxMateIn: 4,
      maxRating: 1750,
      difficulties: ['medium', 'advanced', 'expert'],
    };
  }

  return {
    label: 'Master climb',
    minMateIn: 3,
    maxMateIn: Infinity,
    maxRating: Infinity,
    difficulties: ['advanced', 'expert', 'master'],
  };
}

function getEndlessEligiblePuzzleIndexes(solvedCount) {
  const band = getEndlessDepthBand(solvedCount);
  const productionIndexes = puzzles
    .map((puzzle, index) => ({ puzzle, index }))
    .filter(({ puzzle }) => isProductionTrackPuzzle(puzzle))
    .filter(({ puzzle }) => puzzleFitsAnyMode(puzzle, ['rush', 'endless', 'survival', 'classic', 'blitz']))
    .map(({ index }) => index);
  const bandIndexes = productionIndexes.filter((index) => {
    const item = puzzles[index];
    const difficulty = String(item.difficulty || '').toLowerCase();

    return item.mateIn >= band.minMateIn
      && item.mateIn <= band.maxMateIn
      && (item.rating || 0) <= band.maxRating
      && (band.difficulties.length === 0 || band.difficulties.includes(difficulty));
  });
  const mateFallbackIndexes = productionIndexes.filter((index) => {
    const item = puzzles[index];

    return item.mateIn >= band.minMateIn && item.mateIn <= band.maxMateIn;
  });

  return bandIndexes.length > 0
    ? bandIndexes
    : mateFallbackIndexes.length > 0
      ? mateFallbackIndexes
      : productionIndexes;
}

function getRushEligiblePuzzleIndexes(solvedCount, rushModeKey = RUSH_MODE_KEYS.classic) {
  if (rushModeKey === RUSH_MODE_KEYS.endless) {
    return getEndlessEligiblePuzzleIndexes(solvedCount);
  }

  const rushIndexes = puzzles
    .map((puzzle, index) => ({ puzzle, index }))
    .filter(({ puzzle }) => isProductionTrackPuzzle(puzzle))
    .filter(({ puzzle }) => puzzleFitsMode(puzzle, 'rush') || puzzleFitsMode(puzzle, rushModeKey))
    .map(({ index }) => index);
  const mateInLimit = getRushMateInLimit(solvedCount, rushModeKey);
  const eligibleIndexes = rushIndexes.filter((index) => puzzles[index].mateIn <= mateInLimit);

  return eligibleIndexes.length > 0 ? eligibleIndexes : rushIndexes;
}

function buildRushQueue(solvedCount, usedPuzzleIds = [], rushModeKey = RUSH_MODE_KEYS.classic) {
  const eligibleIndexes = getRushEligiblePuzzleIndexes(solvedCount, rushModeKey);
  const unusedIndexes = eligibleIndexes.filter((index) => !usedPuzzleIds.includes(puzzles[index].id));
  const queueSource = unusedIndexes.length > 0 ? unusedIndexes : eligibleIndexes;

  return shuffle(queueSource);
}

function getRushMultiplier(combo) {
  if (combo >= 8) {
    return 2.5;
  }

  if (combo >= 5) {
    return 2;
  }

  if (combo >= 3) {
    return 1.5;
  }

  if (combo === 2) {
    return 1.25;
  }

  return 1;
}

function getNextRushMultiplierInfo(combo) {
  const nextThreshold = RUSH_MULTIPLIER_THRESHOLDS.find((threshold) => combo < threshold.combo);

  if (!nextThreshold) {
    return {
      label: 'Max multiplier',
      detail: `${getRushMultiplier(combo).toFixed(2)}x active`,
      comboNeeded: 0,
    };
  }

  return {
    label: `Combo ${nextThreshold.combo}`,
    detail: `${Math.max(0, nextThreshold.combo - combo)} more for ${nextThreshold.multiplier.toFixed(2)}x`,
    comboNeeded: nextThreshold.combo - combo,
  };
}

function getNextEndlessMultiplierInfo(streak) {
  const nextThreshold = ENDLESS_MULTIPLIER_THRESHOLDS.find((threshold) => streak < threshold.streak);

  if (!nextThreshold) {
    return {
      label: 'Max streak',
      detail: `${getEndlessStreakMultiplier(streak).toFixed(2)}x active`,
      comboNeeded: 0,
    };
  }

  return {
    label: `Streak ${nextThreshold.streak}`,
    detail: `${Math.max(0, nextThreshold.streak - streak)} more for ${nextThreshold.multiplier.toFixed(2)}x`,
    comboNeeded: nextThreshold.streak - streak,
  };
}

function getFastSolveTarget(mateIn) {
  return {
    1: 10,
    2: 20,
    3: 35,
    4: 60,
    5: 90,
    6: 120,
    7: 150,
  }[mateIn] || 150;
}

function getRushRank(score) {
  return getRushRankProgress(score).current.rank;
}

function getRushRankProgress(score) {
  const currentIndex = RUSH_RANKS.reduce((bestIndex, rank, index) => {
    return score >= rank.minScore ? index : bestIndex;
  }, 0);
  const current = RUSH_RANKS[currentIndex];
  const next = RUSH_RANKS[currentIndex + 1] || null;
  const pointsNeeded = next ? Math.max(0, next.minScore - score) : 0;
  const progressPercent = next
    ? Math.round(((score - current.minScore) / (next.minScore - current.minScore)) * 100)
    : 100;

  return {
    current,
    next,
    pointsNeeded,
    progressPercent: Math.max(0, Math.min(100, progressPercent)),
  };
}

function getRushBadges(result) {
  return [
    result.isNewBest ? 'New Best' : '',
    result.isNewBestCombo ? 'Best Combo' : '',
    result.mistakes === 0 && result.skips === 0 ? 'Perfect Run' : '',
    result.skips === 0 ? 'No Skip' : '',
    result.bestCombo >= 5 ? 'Combo 5' : '',
    result.averageSolveTime < 20 && result.solved >= 3 ? 'Fast Hands' : '',
  ].filter(Boolean);
}

function getResultEarnedChests(result) {
  if (Array.isArray(result?.earnedChests)) {
    return result.earnedChests;
  }

  return result?.earnedChest ? [result.earnedChest] : [];
}

function getDailyRushOutcomeEmoji(outcome) {
  return {
    perfect: '🟩',
    solved: '🟨',
    missed: '🟥',
    skipped: '⬛',
    notReached: '⬛',
  }[outcome?.status || outcome] || '⬛';
}

function getDailyRushOutcomeRow(outcomes = [], totalPuzzles = DAILY_RUSH_PUZZLE_COUNT) {
  return Array.from({ length: totalPuzzles }, (_, index) => {
    return getDailyRushOutcomeEmoji(outcomes[index] || 'notReached');
  }).join('');
}

function formatDailyRushShareText(result) {
  return [
    'QuickMate Daily Rush',
    `#${result.dailyRushNumber} | ${result.dailyRushDate} | ${result.dailyRushLabel}`,
    `${result.totalScore} score | ${result.solved}/${result.totalPuzzles} solved`,
    `${result.rank} | combo ${result.bestCombo} | streak ${result.dailyRushStreak}`,
    getDailyRushOutcomeRow(result.outcomes, result.totalPuzzles),
    'quickmate.local',
  ].join('\n');
}

function getDailyRushStoredResult(result) {
  return {
    date: result.dailyRushDate,
    dailyRushNumber: result.dailyRushNumber,
    score: result.totalScore,
    solved: result.solved,
    totalPuzzles: result.totalPuzzles,
    livesRemaining: result.livesRemaining,
    mistakes: result.mistakes,
    misses: result.misses,
    skips: result.skips,
    bestCombo: result.bestCombo,
    rank: result.rank,
    streak: result.dailyRushStreak,
    outcomes: result.outcomes,
    puzzleIds: result.puzzleIds,
    completedAt: result.completedAt,
  };
}

function getNextDailyRushStreak(currentStats, dateKey) {
  return currentStats.dailyRushDate === getYesterdayKey(dateKey)
    ? (currentStats.dailyRushStreak || 0) + 1
    : 1;
}

function getRushReviewItem(item, reason, details = {}) {
  return {
    id: item.id,
    title: item.title,
    mateIn: item.mateIn,
    themes: getPuzzleThemes(item),
    firstMove: item.solution[0],
    solution: item.solution,
    reason,
    wrongMoveCount: details.wrongMoveCount ?? 0,
  };
}

function formatPuzzleFeedbackText(item, rushModeLabel) {
  const solutionLine = item.solution || [item.firstMove].filter(Boolean);

  return [
    `Puzzle ID: ${item.id}`,
    `Title: ${item.title}`,
    `Mate in: ${item.mateIn}`,
    `Themes: ${formatTheme(item.themes)}`,
    `Rush mode: ${rushModeLabel || 'Rush Mode'}`,
    `Result reason: ${String(item.reason || '').toLowerCase()}`,
    `Correct solution line: ${solutionLine.join(' ')}`,
    'Issue:',
  ].join('\n');
}

function getMateIn(puzzle) {
  return puzzle.mateIn;
}

function calculateScore({ mateIn, mistakes, hints, seconds }) {
  const base = mateIn * 100;
  const noMistakesBonus = mistakes === 0 ? 150 : 0;
  const noHintsBonus = hints === 0 ? 100 : 0;
  const fastSolveBonus = Math.max(0, 300 - seconds * 10);
  const wrongMovePenalty = mistakes * 75;
  const hintPenalty = hints * 100;
  const score = Math.max(
    0,
    base + noMistakesBonus + noHintsBonus + fastSolveBonus - wrongMovePenalty - hintPenalty,
  );

  return {
    base,
    noMistakesBonus,
    noHintsBonus,
    fastSolveBonus,
    wrongMovePenalty,
    hintPenalty,
    score,
  };
}

function getEndlessStreakMultiplier(streak) {
  if (streak >= 30) {
    return 3;
  }

  if (streak >= 20) {
    return 2.5;
  }

  if (streak >= 10) {
    return 2;
  }

  if (streak >= 5) {
    return 1.5;
  }

  return 1;
}

function calculateEndlessSolveScore({ puzzle, depth, streak }) {
  const mateIn = puzzle.mateIn || 1;
  const base = 200 + mateIn * 120;
  const depthBonus = Math.floor((depth - 1) / 5) * 75;
  const milestoneBonus = depth % 5 === 0 ? 500 : 0;
  const streakMultiplier = getEndlessStreakMultiplier(streak);
  const score = Math.round((base + depthBonus) * streakMultiplier + milestoneBonus);

  return {
    base,
    depthBonus,
    milestoneBonus,
    streakMultiplier,
    score,
  };
}

function getRushModeLabel(rushModeKey) {
  return getRushModeConfig(rushModeKey).label;
}

function getBestRushScoreForMode(stats, rushModeKey) {
  const config = getRushModeConfig(rushModeKey);
  return stats[config.bestScoreKey] || 0;
}

function getBestOverallRushScore(stats) {
  return Math.max(
    stats.bestRushScore || 0,
    stats.bestBlitzRushScore || 0,
    stats.bestClassicRushScore || 0,
    stats.bestSurvivalRushScore || 0,
    stats.bestEndlessScore || 0,
  );
}

function normalizeOwnedCollectionItems(value) {
  return Array.isArray(value)
    ? [...new Set(value.filter((itemId) => typeof itemId === 'string' && itemId.trim() !== ''))]
    : [];
}

function normalizeUnopenedChests(value) {
  return Array.isArray(value)
    ? value.filter((chest) => chest && typeof chest.chestId === 'string' && typeof chest.chestTypeId === 'string')
    : [];
}

function normalizeStringArray(value) {
  return Array.isArray(value)
    ? [...new Set(value.filter((item) => typeof item === 'string' && item.trim() !== ''))]
    : [];
}

function getAchievementById(achievementId) {
  return ACHIEVEMENTS.find((achievement) => achievement.id === achievementId) || null;
}

function getQualifiedAchievementIds(stats) {
  return ACHIEVEMENTS
    .filter((achievement) => achievement.isUnlocked(stats))
    .map((achievement) => achievement.id);
}

function getVisibleAchievementIds(stats) {
  return [
    ...new Set([
      ...normalizeStringArray(stats.unlockedAchievements),
      ...getQualifiedAchievementIds(stats),
    ]),
  ];
}

function getUnlockedAchievementItems(stats) {
  const visibleIds = new Set(getVisibleAchievementIds(stats));

  return ACHIEVEMENTS.filter((achievement) => visibleIds.has(achievement.id));
}

function applyAchievementUnlocks(nextStats, currentStats) {
  const previousIds = new Set(getVisibleAchievementIds(currentStats));
  const storedIds = new Set(normalizeStringArray(nextStats.unlockedAchievements));
  const qualifiedIds = getQualifiedAchievementIds(nextStats);
  const nextUnlockedIds = [
    ...new Set([
      ...storedIds,
      ...qualifiedIds,
    ]),
  ];
  const newAchievements = qualifiedIds
    .filter((achievementId) => !previousIds.has(achievementId))
    .map(getAchievementById)
    .filter(Boolean);

  return {
    nextStats: {
      ...nextStats,
      unlockedAchievements: nextUnlockedIds,
    },
    newAchievements,
  };
}

function getCollectionStatsSummary(ownedCollectionItems, unopenedChests, previousStats = {}) {
  const ownedIds = new Set(ownedCollectionItems);
  const setsCompleted = PIECE_SETS.filter((pieceSet) => {
    return pieceSet.pieces.every((piece) => ownedIds.has(piece.collectionItemId));
  }).length;
  const totalPiecesOwned = ownedIds.size;

  return {
    ...DEFAULT_COLLECTION_STATS,
    ...previousStats,
    totalPiecesOwned,
    piecesUnlocked: Math.max(previousStats.piecesUnlocked || 0, totalPiecesOwned),
    setsCompleted,
    unopenedChests: unopenedChests.length,
  };
}

function getRarityClassName(rarity) {
  return `rarity-${String(rarity || 'common').toLowerCase()}`;
}

function getCollectionSetProgress(setId, ownedCollectionItems) {
  const pieceSet = PIECE_SETS.find((item) => item.setId === setId);
  const ownedIds = new Set(ownedCollectionItems);

  if (!pieceSet) {
    return {
      setName: 'Collection Set',
      ownedCount: 0,
      totalCount: 0,
      isComplete: false,
      cosmeticReward: '',
    };
  }

  const ownedCount = pieceSet.pieces.filter((piece) => ownedIds.has(piece.collectionItemId)).length;

  return {
    setName: pieceSet.setName,
    ownedCount,
    totalCount: pieceSet.pieces.length,
    isComplete: ownedCount === pieceSet.pieces.length,
    cosmeticReward: pieceSet.cosmeticReward,
  };
}

function getCollectionItemById(collectionItemId) {
  return COLLECTION_ITEMS.find((item) => item.collectionItemId === collectionItemId) || null;
}

function getChestTypeById(chestTypeId) {
  return CHEST_TYPES.find((chestType) => chestType.id === chestTypeId) || CHEST_TYPES[0];
}

function createLadderChestReward({
  chestTypeId,
  nodeId,
  nodeTitle,
  zoneName = 'Ladder World',
  bonusReason = 'Ladder node clear',
}) {
  const chestType = getChestTypeById(chestTypeId);
  const earnedAt = new Date().toISOString();

  return {
    chestId: `ladder-${nodeId}-${chestType.id}-${earnedAt}-${Math.random().toString(36).slice(2, 8)}`,
    chestTypeId: chestType.id,
    name: chestType.name,
    tier: chestType.tier,
    earnedFrom: `${zoneName}: ${nodeTitle}`,
    earnedAt,
    sourceScore: 0,
    sourceRank: 'Ladder World',
    bonusReason,
    opened: false,
  };
}

function getLadderNodeRewardLabel(node) {
  const rewards = [`${node.rewardXp} XP`];

  if (node.rewardChestTypeId) {
    rewards.push(getChestTypeById(node.rewardChestTypeId).name);
  }

  if (node.rewardCollectionItemId) {
    const collectionItem = getCollectionItemById(node.rewardCollectionItemId);
    rewards.push(collectionItem?.displayName || 'Collection piece');
  }

  if (node.rewardBadge) {
    rewards.push(node.rewardBadge);
  }

  return rewards.join(', ');
}

function getRushRunAccuracy(rushStatsValue) {
  const attempts = rushStatsValue.solved + rushStatsValue.misses + rushStatsValue.skips;

  return attempts > 0 ? rushStatsValue.solved / attempts : 0;
}

function rushRunMatchesChestRule(rushStatsValue, rule) {
  return rushStatsValue.totalScore >= rule.minScore
    && rushStatsValue.solved >= rule.minSolved
    && rushStatsValue.perfectSolves >= (rule.minPerfectSolves || 0)
    && rushStatsValue.bestCombo >= (rule.minBestCombo || 0)
    && rushStatsValue.mistakes <= (rule.maxMistakes ?? Infinity)
    && rushStatsValue.skips <= (rule.maxSkips ?? Infinity)
    && getRushRunAccuracy(rushStatsValue) >= (rule.minAccuracy || 0);
}

function getRushChestRule(rushModeKey, rushStatsValue) {
  const rules = RUSH_CHEST_RULES[rushModeKey] || RUSH_CHEST_RULES[RUSH_MODE_KEYS.classic];

  return rules.find((rule) => rushRunMatchesChestRule(rushStatsValue, rule)) || null;
}

function createRushChestReward({ rushMode, rushStatsValue, rank, isNewBest }) {
  const rule = getRushChestRule(rushMode.key, rushStatsValue);

  if (!rule) {
    return null;
  }

  const chestType = getChestTypeById(rule.chestTypeId);
  const earnedAt = new Date().toISOString();

  return {
    chestId: `${chestType.id}-${earnedAt}-${Math.random().toString(36).slice(2, 8)}`,
    chestTypeId: chestType.id,
    name: chestType.name,
    tier: chestType.tier,
    earnedFrom: rushMode.label,
    earnedAt,
    sourceScore: rushStatsValue.totalScore,
    sourceRank: rank,
    bonusReason: isNewBest ? `${rule.reason} + new best score` : rule.reason,
    opened: false,
  };
}

function createRushMilestoneChestReward(milestone) {
  const chestType = getChestTypeById(milestone.chestTypeId);
  const earnedAt = new Date().toISOString();

  return {
    chestId: `rush-milestone-${milestone.runs}-${chestType.id}-${earnedAt}`,
    chestTypeId: chestType.id,
    name: chestType.name,
    tier: chestType.tier,
    earnedFrom: 'Rush Milestone',
    earnedAt,
    sourceScore: 0,
    sourceRank: `${milestone.runs} Rush runs`,
    bonusReason: milestone.label,
    milestoneId: milestone.id,
    opened: false,
  };
}

function getNewRushMilestoneRewards({ previousRunCount, nextRunCount, awardedMilestoneIds }) {
  const awardedIds = new Set(normalizeStringArray(awardedMilestoneIds));

  return RUSH_MILESTONE_CHESTS
    .filter((milestone) => previousRunCount < milestone.runs
      && nextRunCount >= milestone.runs
      && !awardedIds.has(milestone.id))
    .map((milestone) => ({
      milestone,
      chest: createRushMilestoneChestReward(milestone),
    }));
}

function getRushNoChestReason(rushModeKey) {
  if (rushModeKey === RUSH_MODE_KEYS.endless) {
    return 'No chest earned. Reach depth 8 for a Common chest, depth 18 for Rare, or depth 35 for Epic.';
  }

  const thresholds = RUSH_CHEST_SCORE_THRESHOLDS[rushModeKey] || RUSH_CHEST_SCORE_THRESHOLDS[RUSH_MODE_KEYS.classic];

  return `No chest earned. Reach about ${thresholds.common} points with a solid solve streak, or hit a Rush milestone.`;
}

function getDailyRushChestType(score, rank) {
  if (score >= 2500 || ['Attacker', 'Closer', 'Checkmate Machine', 'QuickMate Master'].includes(rank)) {
    return getChestTypeById('royal-chest');
  }

  if (score >= 1200 || rank === 'Tactician') {
    return getChestTypeById('tactical-chest');
  }

  return getChestTypeById('basic-chest');
}

function createDailyRushChestReward({ score, rank, dateKey }) {
  const chestType = getDailyRushChestType(score, rank);
  const earnedAt = new Date().toISOString();

  return {
    chestId: `daily-rush-${dateKey}-${chestType.id}`,
    chestTypeId: chestType.id,
    name: chestType.name,
    tier: chestType.tier,
    earnedFrom: `Daily Rush ${dateKey}`,
    earnedAt,
    sourceScore: score,
    sourceRank: rank,
    bonusReason: 'Official Daily Rush completion',
    opened: false,
  };
}

function getRandomUnownedCollectionItem(ownedCollectionItems) {
  const ownedIds = new Set(ownedCollectionItems);
  const unownedItems = COLLECTION_ITEMS.filter((item) => !ownedIds.has(item.collectionItemId));

  if (unownedItems.length === 0) {
    return null;
  }

  return unownedItems[Math.floor(Math.random() * unownedItems.length)];
}

function loadStats() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : {};
    const legacyBestRushScore = parsed.bestRushScore || 0;
    const bestBlitzRushScore = parsed.bestBlitzRushScore || 0;
    const bestClassicRushScore = parsed.bestClassicRushScore ?? legacyBestRushScore;
    const bestSurvivalRushScore = parsed.bestSurvivalRushScore || 0;
    const bestEndlessScore = parsed.bestEndlessScore || 0;
    const bestDailyRushScore = parsed.bestDailyRushScore || parsed.dailyRushOfficialResult?.score || 0;
    const ownedCollectionItems = normalizeOwnedCollectionItems(parsed.ownedCollectionItems);
    const unopenedChests = normalizeUnopenedChests(parsed.unopenedChests);
    const completedLadderNodes = normalizeStringArray(parsed.completedLadderNodes);
    const ladderBadges = normalizeStringArray(parsed.ladderBadges);
    const rushMilestoneChestsAwarded = normalizeStringArray(parsed.rushMilestoneChestsAwarded);
    const unlockedAchievements = normalizeStringArray(parsed.unlockedAchievements);
    return {
      ...DEFAULT_STATS,
      ...parsed,
      bestRushScore: Math.max(
        legacyBestRushScore,
        bestBlitzRushScore,
        bestClassicRushScore,
        bestSurvivalRushScore,
        bestEndlessScore,
      ),
      bestBlitzRushScore,
      bestClassicRushScore,
      bestSurvivalRushScore,
      bestEndlessScore,
      bestEndlessDepth: parsed.bestEndlessDepth || 0,
      bestEndlessStreak: parsed.bestEndlessStreak || 0,
      totalEndlessRuns: parsed.totalEndlessRuns || 0,
      bestDailyRushScore,
      bestRushCombo: parsed.bestRushCombo
        || Math.max(0, ...(parsed.rushHistory || []).map((run) => run.bestCombo || 0)),
      rushGamesPlayed: parsed.rushGamesPlayed || 0,
      perfectRushRuns: parsed.perfectRushRuns || 0,
      rushMilestoneChestsAwarded,
      unlockedAchievements,
      rushHistory: parsed.rushHistory || [],
      bestTimeByPuzzleId: parsed.bestTimeByPuzzleId || {},
      puzzleCompletions: parsed.puzzleCompletions || {},
      dailyRushDate: parsed.dailyRushDate || '',
      dailyRushOfficialResult: parsed.dailyRushOfficialResult || null,
      dailyRushStreak: parsed.dailyRushStreak || 0,
      completedLadderNodes,
      currentZone: parsed.currentZone || PAWN_VILLAGE_ZONE_ID,
      ladderXp: parsed.ladderXp || 0,
      ladderBadges,
      ownedCollectionItems,
      unopenedChests,
      collectionStats: getCollectionStatsSummary(ownedCollectionItems, unopenedChests, parsed.collectionStats),
    };
  } catch {
    return DEFAULT_STATS;
  }
}

function saveStats(stats) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

function getPuzzleBehavior(currentMode) {
  return currentMode === 'rush' || currentMode === 'dailyRush' || currentMode === 'ladderNode'
    ? PUZZLE_BEHAVIOR.strictMode
    : PUZZLE_BEHAVIOR.trainingMode;
}

function moveMatches(move, expectedSan) {
  return move.san === expectedSan;
}

function describeMove(expectedSan, game) {
  const match = game.moves({ verbose: true }).find((move) => move.san === expectedSan);
  return match ? `${match.san} from ${match.from} to ${match.to}` : expectedSan;
}

function playExpectedMove(game, expectedSan) {
  return game.move(expectedSan);
}

function getPuzzleStatus(completion) {
  if (!completion) {
    return 'unplayed';
  }

  return completion.perfect ? 'perfect' : 'solved';
}

function getPuzzleThemes(item) {
  return item.themes || item.theme || [];
}

function formatTheme(themes) {
  return Array.isArray(themes) ? themes.join(', ') : themes;
}

function formatContentStatus(status) {
  return {
    candidate: 'Candidate Puzzles',
    dev: 'Development Puzzles',
    approved: 'Approved Puzzles',
    rejected: 'Rejected Puzzles',
  }[status] || 'Unspecified Puzzles';
}

const BOSS_CINEMATIC_COPY = {
  [PAWN_VILLAGE_ZONE_ID]: {
    tone: 'gold',
    text: 'The first gate falls. The path is open.',
  },
  [KNIGHT_WOODS_ZONE_ID]: {
    tone: 'teal',
    text: 'The trap is sprung, and the woods go quiet.',
  },
  [BISHOP_TOWER_ZONE_ID]: {
    tone: 'royal',
    text: 'The diagonal line is yours. The tower is clear.',
  },
  [ROOK_FORTRESS_ZONE_ID]: {
    tone: 'gold',
    text: 'The fortress rank breaks under clean pressure.',
  },
  [QUEENS_COURT_ZONE_ID]: {
    tone: 'royal',
    text: 'The court yields to a stronger forcing line.',
  },
  [KINGS_GATE_ZONE_ID]: {
    tone: 'teal',
    text: 'The running king has nowhere left to go.',
  },
  [GRANDMASTER_KEEP_ZONE_ID]: {
    tone: 'legendary',
    text: 'The final trial is complete. The first campaign is yours.',
  },
};

function getBossNameFromNodeTitle(nodeTitle = '') {
  return nodeTitle.replace(/^Boss:\s*/i, '') || 'Ladder Boss';
}

function buildBossCinematicRewards(result) {
  const rewards = [];

  if (result.rewardXp > 0) {
    rewards.push(`+${result.rewardXp} XP`);
  }

  if (result.earnedBadge) {
    rewards.push(result.earnedBadge);
  }

  if (result.collectionRewardItem) {
    rewards.push(result.collectionRewardItem.displayName);
  } else if (result.earnedChest) {
    rewards.push(result.earnedChest.name);
  }

  if (result.alreadyCompleted && rewards.length === 0) {
    rewards.push('Rewards already claimed');
  }

  return rewards.length > 0 ? rewards : ['Boss clear recorded'];
}

function createBossCinematicMoment(result) {
  const copy = BOSS_CINEMATIC_COPY[result.zoneId] || BOSS_CINEMATIC_COPY[PAWN_VILLAGE_ZONE_ID];

  return {
    type: 'boss-defeat',
    title: 'Boss Defeated',
    zoneName: result.zoneName || 'Ladder World',
    bossName: getBossNameFromNodeTitle(result.nodeTitle),
    rewards: buildBossCinematicRewards(result),
    text: copy.text,
    tone: copy.tone,
  };
}

function CinematicMoment({ moment, onDismiss }) {
  if (!moment) {
    return null;
  }

  return (
    <section
      className={`cinematic-moment cinematic-${moment.tone || 'gold'}`}
      aria-labelledby="cinematic-title"
      aria-describedby="cinematic-description"
    >
      <div className="cinematic-glow" aria-hidden="true" />
      <div className="cinematic-icon" aria-hidden="true">
        <Trophy size={38} />
      </div>
      <p className="eyebrow">{moment.zoneName}</p>
      <h2 id="cinematic-title">{moment.title}</h2>
      <strong className="cinematic-boss-name">{moment.bossName}</strong>
      <p id="cinematic-description" className="cinematic-copy">{moment.text}</p>
      <div className="cinematic-rewards" aria-label="Reward summary">
        {moment.rewards.map((reward) => (
          <span key={reward}>
            <BadgeCheck size={16} />
            {reward}
          </span>
        ))}
      </div>
      <button type="button" className="primary-action cinematic-continue" onClick={onDismiss}>
        <ChevronRight size={18} />
        Continue
      </button>
    </section>
  );
}

const productionRushPuzzleCount = getPuzzleIndexesForMode('rush', { productionTrackOnly: true }).length;
const hasProductionRushPuzzles = productionRushPuzzleCount > 0;
const dailyRushProductionPuzzleCount = getDailyRushEligiblePuzzleIndexes().length;
const hasDailyRushPuzzles = dailyRushProductionPuzzleCount > 0;

export default function App() {
  const todayKey = getTodayKey();
  const dailyPuzzleIndex = getDailyPuzzleIndex(todayKey);
  const [screen, setScreen] = useState('home');
  const [mode, setMode] = useState('ladder');
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [fen, setFen] = useState(puzzles[0].fen);
  const [solutionIndex, setSolutionIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [hints, setHints] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [feedback, setFeedback] = useState('Find the forcing move.');
  const [moveLog, setMoveLog] = useState([]);
  const [stats, setStats] = useState(loadStats);
  const [result, setResult] = useState(null);
  const [copyStatus, setCopyStatus] = useState('Copy Result');
  const [puzzleFeedbackCopyStatus, setPuzzleFeedbackCopyStatus] = useState({});
  const [rushQueue, setRushQueue] = useState([]);
  const [rushQueueCursor, setRushQueueCursor] = useState(0);
  const [selectedRushMode, setSelectedRushMode] = useState(RUSH_MODE_KEYS.classic);
  const [activeRushMode, setActiveRushMode] = useState(RUSH_MODE_KEYS.classic);
  const [rushTimeLeft, setRushTimeLeft] = useState(RUSH_MODES[RUSH_MODE_KEYS.classic].durationSeconds);
  const [rushLives, setRushLives] = useState(RUSH_MODES[RUSH_MODE_KEYS.classic].lives);
  const [rushStats, setRushStats] = useState(DEFAULT_RUSH_STATS);
  const [rushUsedPuzzleIds, setRushUsedPuzzleIds] = useState([]);
  const [rushMissedPuzzles, setRushMissedPuzzles] = useState([]);
  const [rushPuzzleOutcomes, setRushPuzzleOutcomes] = useState([]);
  const [rushPuzzleMistakes, setRushPuzzleMistakes] = useState(0);
  const [rushReveal, setRushReveal] = useState(null);
  const [activeLadderNodeId, setActiveLadderNodeId] = useState('');
  const [ladderNodeQueue, setLadderNodeQueue] = useState([]);
  const [ladderNodeCursor, setLadderNodeCursor] = useState(0);
  const [ladderNodeStats, setLadderNodeStats] = useState(DEFAULT_LADDER_NODE_STATS);
  const [ladderNodeLives, setLadderNodeLives] = useState(0);
  const [ladderNodePuzzleMistakes, setLadderNodePuzzleMistakes] = useState(0);
  const [ladderNodeReveal, setLadderNodeReveal] = useState(null);
  const [dailyRushRunDate, setDailyRushRunDate] = useState(todayKey);
  const [dailyRushPracticeRun, setDailyRushPracticeRun] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [openLadderSections, setOpenLadderSections] = useState({ candidate: true, dev: false });
  const [openLadderMateGroups, setOpenLadderMateGroups] = useState({ 'candidate:1': true });
  const [chestOpenResult, setChestOpenResult] = useState(null);
  const [brandLogoStatus, setBrandLogoStatus] = useState('loading');
  const [cinematicMoment, setCinematicMoment] = useState(null);

  const puzzle = puzzles[puzzleIndex];
  const game = useMemo(() => new Chess(fen), [fen]);
  const expectedMove = puzzle.solution[solutionIndex];
  const progress = Math.round((solutionIndex / puzzle.solution.length) * 100);
  const boardOrientation = puzzle.sideToMove === 'black' ? 'black' : 'white';
  const mateIn = getMateIn(puzzle);
  const dailyDone = stats.completedDailyPuzzleDate === todayKey;
  const isDailyRush = mode === 'dailyRush';
  const isRush = mode === 'rush' || isDailyRush;
  const isEndlessRush = mode === 'rush' && activeRushMode === RUSH_MODE_KEYS.endless;
  const isLadderNode = mode === 'ladderNode';
  const isChallengeRun = isRush || isLadderNode;
  const puzzleBehavior = getPuzzleBehavior(mode);
  const activeLadderNode = activeLadderNodeId ? getLadderNodeById(activeLadderNodeId) : null;
  const activeLadderZone = activeLadderNode ? getLadderZoneById(activeLadderNode.zoneId) : null;
  const activeLadderZoneProgress = activeLadderNode
    ? getLadderZoneProgress(activeLadderNode.zoneId, stats.completedLadderNodes || [])
    : null;
  const activeLadderNodeTotal = activeLadderNode?.puzzleCount || ladderNodeQueue.length || 0;
  const completedLadderNodeIds = useMemo(() => {
    return new Set(stats.completedLadderNodes || []);
  }, [stats.completedLadderNodes]);
  const grandmasterKeepProgress = getLadderZoneProgress(GRANDMASTER_KEEP_ZONE_ID, stats.completedLadderNodes || []);
  const grandmasterKeepUnlocked = ladderZoneIsUnlocked(GRANDMASTER_KEEP_ZONE_ID, stats.completedLadderNodes || []);
  const ladderCampaignProgress = getLadderCampaignProgress(stats.completedLadderNodes || []);
  const ladderCampaignComplete = ladderCampaignProgress.worldsCompleted >= ladderCampaignProgress.totalWorlds;
  const currentCampaignZone = getCurrentLadderCampaignZone(stats.completedLadderNodes || []);
  const nextCampaignZone = currentCampaignZone ? getNextLadderZone(currentCampaignZone.id) : null;
  const ladderCampaignPath = LADDER_WORLD_ZONES.map((zone) => zone.name).join(' → ');
  const ladderBadgesEarned = normalizeStringArray(stats.ladderBadges).length;
  const selectedRushModeConfig = getRushModeConfig(selectedRushMode);
  const activeRushModeConfig = getRushModeConfig(activeRushMode);
  const rushIsTimed = rushModeIsTimed(activeRushMode);
  const activeRushPuzzleAttemptLimit = isEndlessRush ? 1 : RUSH_MAX_PUZZLE_ATTEMPTS;
  const selectedRushModeBestScore = getBestRushScoreForMode(stats, selectedRushMode);
  const activeRushModeBestScore = getBestRushScoreForMode(stats, activeRushMode);
  const activeRushBestRecord = isEndlessRush ? stats.bestEndlessDepth || 0 : activeRushModeBestScore;
  const todaysDailyRushSequence = useMemo(() => buildDailyRushSequence(todayKey), [todayKey]);
  const dailyRushOfficialResult = stats.dailyRushDate === todayKey ? stats.dailyRushOfficialResult : null;
  const dailyRushCompletedToday = Boolean(dailyRushOfficialResult);
  const dailyRushNumber = getDailyRushNumber(todayKey);
  const dailyRushStatusLabel = dailyRushCompletedToday ? 'Completed' : 'Open today';
  const rushRunShouldFinishAfterReveal = isDailyRush
    && rushUsedPuzzleIds.length >= DAILY_RUSH_PUZZLE_COUNT;
  const boardIsInteractive = screen === 'game'
    && !isComplete
    && Boolean(expectedMove)
    && (!isRush || ((!rushIsTimed || rushTimeLeft > 0) && rushLives > 0 && !rushReveal))
    && (!isLadderNode || (!ladderNodeReveal && (!activeLadderNode?.lives || ladderNodeLives > 0)));
  const rushMultiplier = isEndlessRush
    ? getEndlessStreakMultiplier(rushStats.currentCombo)
    : getRushMultiplier(rushStats.currentCombo);
  const nextRushMultiplier = isEndlessRush
    ? getNextEndlessMultiplierInfo(rushStats.currentCombo)
    : getNextRushMultiplierInfo(rushStats.currentCombo);
  const bestRushCombo = stats.bestRushCombo || 0;
  const bestOverallRushScore = getBestOverallRushScore(stats);
  const bestRushRank = getRushRank(bestOverallRushScore);
  const recentRushRuns = (stats.rushHistory || []).slice(0, 3);
  const ownedCollectionItemIds = useMemo(() => {
    return new Set(stats.ownedCollectionItems || []);
  }, [stats.ownedCollectionItems]);
  const collectionStats = getCollectionStatsSummary(
    stats.ownedCollectionItems || [],
    stats.unopenedChests || [],
    stats.collectionStats,
  );
  const unopenedChestList = normalizeUnopenedChests(stats.unopenedChests);
  const visibleAchievementIds = new Set(getVisibleAchievementIds(stats));
  const unlockedAchievements = getUnlockedAchievementItems(stats);
  const collectionCompletionPercent = COLLECTION_ITEMS.length > 0
    ? Math.round((collectionStats.totalPiecesOwned / COLLECTION_ITEMS.length) * 100)
    : 0;
  const selectedSquareStyles = selectedSquare
    ? {
        [selectedSquare]: {
          boxShadow: 'inset 0 0 0 4px rgba(255, 226, 95, 0.95)',
          background: 'linear-gradient(135deg, rgba(255, 226, 95, 0.42), rgba(255, 255, 255, 0.08))',
        },
      }
    : {};
  const ladderPuzzleSections = useMemo(() => {
    const sectionMap = puzzles.reduce((groups, item, index) => {
      const statusKey = item.contentStatus || 'unspecified';
      const mateGroupKey = getLadderMateGroupKey(item.mateIn);

      if (!groups[statusKey]) {
        groups[statusKey] = {};
      }

      if (!groups[statusKey][mateGroupKey]) {
        groups[statusKey][mateGroupKey] = [];
      }

      groups[statusKey][mateGroupKey].push({ item, index });
      return groups;
    }, {});

    return Object.entries(sectionMap)
      .sort(([firstStatus], [secondStatus]) => {
        const firstIndex = LADDER_CONTENT_SECTION_ORDER.indexOf(firstStatus);
        const secondIndex = LADDER_CONTENT_SECTION_ORDER.indexOf(secondStatus);
        const normalizedFirstIndex = firstIndex === -1 ? LADDER_CONTENT_SECTION_ORDER.length : firstIndex;
        const normalizedSecondIndex = secondIndex === -1 ? LADDER_CONTENT_SECTION_ORDER.length : secondIndex;

        return normalizedFirstIndex - normalizedSecondIndex || firstStatus.localeCompare(secondStatus);
      })
      .map(([contentStatus, mateGroups]) => {
        const groups = LADDER_MATE_GROUPS
          .map((mateGroup) => ({
            ...mateGroup,
            items: mateGroups[mateGroup.key] || [],
          }))
          .filter((mateGroup) => mateGroup.items.length > 0);

        return {
          contentStatus,
          label: formatContentStatus(contentStatus),
          count: groups.reduce((total, mateGroup) => total + mateGroup.items.length, 0),
          groups,
        };
      });
  }, []);

  useEffect(() => {
    if (screen !== 'game' || isComplete) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setSeconds((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [screen, isComplete, puzzleIndex]);

  useEffect(() => {
    if (screen !== 'game' || !isRush || !rushIsTimed || isComplete || rushTimeLeft <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setRushTimeLeft((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [screen, isRush, rushIsTimed, isComplete, rushTimeLeft]);

  useEffect(() => {
    if (screen === 'game' && isRush && rushIsTimed && !isComplete && rushTimeLeft === 0) {
      endRush();
    }
  }, [screen, isRush, rushIsTimed, isComplete, rushTimeLeft]);

  function resetPuzzle(index = puzzleIndex, nextMode = mode, nextFeedback = 'Find the forcing move.') {
    const nextPuzzle = puzzles[index];
    setMode(nextMode);
    setPuzzleIndex(index);
    setFen(nextPuzzle.fen);
    setSolutionIndex(0);
    setMistakes(0);
    setHints(0);
    setSeconds(0);
    setIsComplete(false);
    setMoveLog([]);
    setResult(null);
    setCopyStatus('Copy Result');
    setPuzzleFeedbackCopyStatus({});
    setChestOpenResult(null);
    setCinematicMoment(null);
    setFeedback(nextFeedback);
    setSelectedSquare(null);
    setRushPuzzleMistakes(0);
    setRushReveal(null);
    setLadderNodePuzzleMistakes(0);
    setLadderNodeReveal(null);
  }

  function startPuzzle(index, nextMode = 'ladder') {
    if (nextMode !== 'ladderNode') {
      setActiveLadderNodeId('');
    }

    resetPuzzle(index, nextMode);
    setScreen('game');
  }

  function startDaily() {
    startPuzzle(dailyPuzzleIndex, 'daily');
  }

  function startDailyRush() {
    const dateKey = getTodayKey();
    const queue = buildDailyRushSequence(dateKey);
    const isPracticeReplay = stats.dailyRushDate === dateKey;

    if (queue.length === 0) {
      setFeedback('No production-track Daily Rush puzzles are available.');
      return;
    }

    setActiveRushMode(RUSH_MODE_KEYS.dailyRush);
    setDailyRushRunDate(dateKey);
    setDailyRushPracticeRun(isPracticeReplay);
    setRushQueue(queue);
    setRushQueueCursor(0);
    setRushTimeLeft(0);
    setRushLives(DAILY_RUSH_LIVES);
    setRushStats(DEFAULT_RUSH_STATS);
    setRushUsedPuzzleIds([]);
    setRushMissedPuzzles([]);
    setRushPuzzleOutcomes([]);
    setRushPuzzleMistakes(0);
    setRushReveal(null);
    resetPuzzle(
      queue[0],
      'dailyRush',
      isPracticeReplay ? "Practice Replay. This will not replace today's official result." : 'Daily Rush: solve 10 fixed puzzles.',
    );
    setScreen('game');
  }

  function openRushIntro() {
    setMode('rush');
    setScreen('rushIntro');
  }

  function openLadderWorld() {
    setMode('ladder');
    setScreen('ladderWorld');
  }

  function openLadderZone(zoneId) {
    if (!ladderZoneIsUnlocked(zoneId, stats.completedLadderNodes || [])) {
      setFeedback(`${getLadderZoneById(zoneId).name} is locked.`);
      return;
    }

    setMode('ladder');
    setScreen(getLadderZoneScreen(zoneId));
  }

  function startLadderNode(nodeId) {
    const node = getLadderNodeById(nodeId);
    const zone = getLadderZoneById(node.zoneId);
    const queue = buildLadderNodeQueue(node.id);

    if (queue.length === 0) {
      setFeedback(`No production-track ${zone.name} puzzles are available.`);
      return;
    }

    setActiveLadderNodeId(node.id);
    setLadderNodeQueue(queue);
    setLadderNodeCursor(0);
    setLadderNodeStats(DEFAULT_LADDER_NODE_STATS);
    setLadderNodeLives(node.lives || 0);
    setLadderNodePuzzleMistakes(0);
    setLadderNodeReveal(null);
    resetPuzzle(queue[0], 'ladderNode', `${node.title}: solve ${node.clearRequirement} of ${node.puzzleCount}.`);
    setScreen('game');
  }

  function openCollection() {
    setScreen('collection');
  }

  function viewCollectionFromChest() {
    setIsComplete(false);
    setResult(null);
    setChestOpenResult(null);
    setCinematicMoment(null);
    setScreen('collection');
  }

  function returnToRushFromChest() {
    const resultMode = result?.mode;
    const resultZoneId = result?.zoneId;

    setIsComplete(false);
    setResult(null);
    setChestOpenResult(null);
    setCinematicMoment(null);
    if (resultMode === 'dailyRush') {
      setScreen('home');
      return;
    }

    if (resultMode === 'ladderNode') {
      openLadderZone(resultZoneId || PAWN_VILLAGE_ZONE_ID);
      return;
    }

    openRushIntro();
  }

  function startRush() {
    const rushModeKey = selectedRushMode;
    const rushMode = getRushModeConfig(rushModeKey);
    const queue = buildRushQueue(0, [], rushModeKey);

    if (queue.length === 0) {
      setFeedback('No production-track Rush puzzles are available.');
      return;
    }

    setActiveRushMode(rushModeKey);
    setRushQueue(queue);
    setRushQueueCursor(0);
    setRushTimeLeft(rushMode.durationSeconds ?? 0);
    setRushLives(rushMode.lives);
    setRushStats(DEFAULT_RUSH_STATS);
    setRushUsedPuzzleIds([]);
    setRushMissedPuzzles([]);
    setRushPuzzleOutcomes([]);
    setRushPuzzleMistakes(0);
    setRushReveal(null);
    setDailyRushPracticeRun(false);
    setActiveLadderNodeId('');
    resetPuzzle(queue[0], 'rush');
    setScreen('game');
  }

  function choosePuzzle(index) {
    startPuzzle(index, 'ladder');
  }

  function goToOffset(offset) {
    if (isRush) {
      resetPuzzle(puzzleIndex, 'rush');
      return;
    }

    if (mode === 'daily') {
      resetPuzzle(dailyPuzzleIndex, 'daily');
      return;
    }

    const nextIndex = (puzzleIndex + offset + puzzles.length) % puzzles.length;
    resetPuzzle(nextIndex, 'ladder');
  }

  function advanceRushPuzzle(
    nextSolvedCount = rushStats.solved,
    nextUsedPuzzleIds = rushUsedPuzzleIds,
    nextFeedback = 'Find the forcing move.',
  ) {
    if (isDailyRush) {
      const nextCursor = nextUsedPuzzleIds.length;

      if (nextCursor >= rushQueue.length || nextCursor >= DAILY_RUSH_PUZZLE_COUNT) {
        endRush({ usedPuzzleIdsOverride: nextUsedPuzzleIds });
        return;
      }

      setRushQueueCursor(nextCursor);
      resetPuzzle(rushQueue[nextCursor], 'dailyRush', nextFeedback);
      return;
    }

    const nextQueue = buildRushQueue(nextSolvedCount, nextUsedPuzzleIds, activeRushMode);
    const nextCursor = 0;

    if (nextQueue.length === 0) {
      endRush();
      return;
    }

    setRushQueue(nextQueue);
    setRushQueueCursor(nextCursor);
    resetPuzzle(nextQueue[nextCursor], 'rush', nextFeedback);
  }

  function endRush({
    rushStatsOverride = rushStats,
    livesOverride = rushLives,
    missedPuzzlesOverride = rushMissedPuzzles,
    usedPuzzleIdsOverride = rushUsedPuzzleIds,
    outcomesOverride = rushPuzzleOutcomes,
  } = {}) {
    const finalRushStats = rushStatsOverride;
    const finalLives = livesOverride;
    const finalMissedPuzzles = missedPuzzlesOverride;
    const finalUsedPuzzleIds = usedPuzzleIdsOverride;
    const finalOutcomes = outcomesOverride;
    const endingDailyRush = mode === 'dailyRush' || activeRushMode === RUSH_MODE_KEYS.dailyRush;
    const finalDailyRushDate = dailyRushRunDate || todayKey;
    const completedAt = new Date().toISOString();
    const currentStats = loadStats();
    const averageSolveTime = finalRushStats.solved > 0
      ? Math.round(finalRushStats.totalSolveSeconds / finalRushStats.solved)
      : 0;
    const rushMode = activeRushModeConfig;
    const endingEndlessRush = !endingDailyRush && rushMode.key === RUSH_MODE_KEYS.endless;
    const previousBestModeScore = endingDailyRush
      ? currentStats.bestDailyRushScore || 0
      : currentStats[rushMode.bestScoreKey] || 0;
    const previousBestRushCombo = currentStats.bestRushCombo || 0;
    const previousBestEndlessDepth = currentStats.bestEndlessDepth || 0;
    const previousBestEndlessStreak = currentStats.bestEndlessStreak || 0;
    const rank = getRushRank(finalRushStats.totalScore);
    const rankProgress = getRushRankProgress(finalRushStats.totalScore);
    const endlessDepth = endingEndlessRush ? finalRushStats.solved : 0;
    const endlessAccuracy = endingEndlessRush ? getRushRunAccuracy(finalRushStats) : 0;
    const dailyRushIsOfficial = endingDailyRush
      && !dailyRushPracticeRun
      && currentStats.dailyRushDate !== finalDailyRushDate;
    const dailyRushStreak = endingDailyRush
      ? (dailyRushIsOfficial ? getNextDailyRushStreak(currentStats, finalDailyRushDate) : currentStats.dailyRushStreak || 0)
      : 0;
    const isNewBestEndlessDepth = endingEndlessRush && endlessDepth > previousBestEndlessDepth;
    const isNewBest = endingDailyRush
      ? dailyRushIsOfficial && finalRushStats.totalScore > previousBestModeScore
      : endingEndlessRush
        ? finalRushStats.totalScore > previousBestModeScore || isNewBestEndlessDepth
        : finalRushStats.totalScore > previousBestModeScore;
    const dailyRushChest = endingDailyRush
      ? (dailyRushIsOfficial
          ? createDailyRushChestReward({
              score: finalRushStats.totalScore,
              rank,
              dateKey: finalDailyRushDate,
            })
          : null)
      : null;
    const performanceChest = endingDailyRush
      ? dailyRushChest
      : createRushChestReward({
          rushMode,
          rushStatsValue: finalRushStats,
          rank,
          isNewBest,
        });
    const previousRushRunCount = currentStats.rushGamesPlayed || 0;
    const nextRushRunCount = endingDailyRush ? previousRushRunCount : previousRushRunCount + 1;
    const milestoneRewards = endingDailyRush
      ? []
      : getNewRushMilestoneRewards({
          previousRunCount: previousRushRunCount,
          nextRunCount: nextRushRunCount,
          awardedMilestoneIds: currentStats.rushMilestoneChestsAwarded,
        });
    const milestoneChests = milestoneRewards.map((reward) => reward.chest);
    const earnedChests = [
      performanceChest,
      ...milestoneChests,
    ].filter(Boolean);
    const earnedChest = earnedChests[0] || null;
    const isPerfectRushRun = !endingDailyRush
      && finalRushStats.solved > 0
      && finalRushStats.misses === 0
      && finalRushStats.skips === 0
      && finalRushStats.mistakes === 0;
    const baseResult = {
      mode: endingDailyRush ? 'dailyRush' : 'rush',
      rushMode: rushMode.key,
      rushModeLabel: rushMode.label,
      livesRemaining: finalLives,
      solved: finalRushStats.solved,
      perfectSolves: finalRushStats.perfectSolves,
      mistakes: finalRushStats.mistakes,
      misses: finalRushStats.misses,
      skips: finalRushStats.skips,
      totalScore: finalRushStats.totalScore,
      averageSolveTime,
      bestCombo: finalRushStats.bestCombo,
      endlessDepth,
      endlessAccuracy,
      bestEndlessDepth: endingEndlessRush ? Math.max(previousBestEndlessDepth, endlessDepth) : undefined,
      bestEndlessStreak: endingEndlessRush ? Math.max(previousBestEndlessStreak, finalRushStats.bestCombo) : undefined,
      isEndlessRush: endingEndlessRush,
      isNewBestEndlessDepth,
      maxPuzzleAttempts: endingEndlessRush ? 1 : RUSH_MAX_PUZZLE_ATTEMPTS,
      rank,
      rankProgress,
      isNewBest,
      isNewBestCombo: !endingDailyRush && finalRushStats.bestCombo > previousBestRushCombo,
      bestRushScore: Math.max(getBestOverallRushScore(currentStats), finalRushStats.totalScore),
      bestModeScore: endingDailyRush && !dailyRushIsOfficial
        ? previousBestModeScore
        : Math.max(previousBestModeScore, finalRushStats.totalScore),
      bestRushCombo: Math.max(previousBestRushCombo, finalRushStats.bestCombo),
      missedPuzzles: finalMissedPuzzles,
      earnedChest,
      earnedChests,
      noChestReason: !endingDailyRush && earnedChests.length === 0 ? getRushNoChestReason(rushMode.key) : '',
      dailyRushDate: endingDailyRush ? finalDailyRushDate : '',
      dailyRushNumber: endingDailyRush ? getDailyRushNumber(finalDailyRushDate) : 0,
      dailyRushLabel: endingDailyRush
        ? (dailyRushIsOfficial ? 'Official Result' : 'Practice Replay')
        : '',
      dailyRushIsOfficial,
      dailyRushStreak,
      totalPuzzles: endingDailyRush ? DAILY_RUSH_PUZZLE_COUNT : undefined,
      puzzleIds: endingDailyRush
        ? rushQueue.slice(0, DAILY_RUSH_PUZZLE_COUNT).map((index) => puzzles[index].id)
        : finalUsedPuzzleIds,
      outcomes: endingDailyRush ? finalOutcomes.slice(0, DAILY_RUSH_PUZZLE_COUNT) : finalOutcomes,
      completedAt,
    };
    const historyEntry = {
      date: completedAt,
      rushMode: rushMode.key,
      rushModeLabel: rushMode.label,
      score: finalRushStats.totalScore,
      rank,
      livesRemaining: finalLives,
      solved: finalRushStats.solved,
      mistakes: finalRushStats.mistakes,
      misses: finalRushStats.misses,
      skips: finalRushStats.skips,
      bestCombo: finalRushStats.bestCombo,
      endlessDepth: endingEndlessRush ? endlessDepth : undefined,
    };
    const ownedCollectionItems = normalizeOwnedCollectionItems(currentStats.ownedCollectionItems);
    const currentUnopenedChests = normalizeUnopenedChests(currentStats.unopenedChests);
    const chestsToStore = endingDailyRush
      ? (dailyRushIsOfficial ? earnedChests : [])
      : earnedChests;
    const unopenedChests = chestsToStore.length > 0
      ? [...currentUnopenedChests, ...chestsToStore]
      : currentUnopenedChests;
    const nextDailyRushStreak = dailyRushIsOfficial
      ? getNextDailyRushStreak(currentStats, finalDailyRushDate)
      : currentStats.dailyRushStreak || 0;
    let nextStats = {
      ...currentStats,
      ownedCollectionItems,
      unopenedChests,
      collectionStats: getCollectionStatsSummary(ownedCollectionItems, unopenedChests, currentStats.collectionStats),
    };

    if (endingDailyRush) {
      nextStats.bestDailyRushScore = dailyRushIsOfficial
        ? Math.max(currentStats.bestDailyRushScore || 0, finalRushStats.totalScore)
        : currentStats.bestDailyRushScore || 0;

      if (dailyRushIsOfficial) {
        const officialResult = {
          ...baseResult,
          dailyRushStreak: nextDailyRushStreak,
        };

        nextStats.dailyRushDate = finalDailyRushDate;
        nextStats.dailyRushStreak = nextDailyRushStreak;
        nextStats.dailyRushOfficialResult = getDailyRushStoredResult(officialResult);
      }
    } else {
      nextStats[rushMode.bestScoreKey] = Math.max(
        currentStats[rushMode.bestScoreKey] || 0,
        finalRushStats.totalScore,
      );
      nextStats.bestRushScore = Math.max(getBestOverallRushScore(currentStats), finalRushStats.totalScore);
      nextStats.bestRushCombo = Math.max(currentStats.bestRushCombo || 0, finalRushStats.bestCombo);
      nextStats.rushGamesPlayed = nextRushRunCount;
      nextStats.perfectRushRuns = (currentStats.perfectRushRuns || 0) + (isPerfectRushRun ? 1 : 0);
      if (endingEndlessRush) {
        nextStats.bestEndlessDepth = Math.max(previousBestEndlessDepth, endlessDepth);
        nextStats.bestEndlessScore = Math.max(currentStats.bestEndlessScore || 0, finalRushStats.totalScore);
        nextStats.bestEndlessStreak = Math.max(previousBestEndlessStreak, finalRushStats.bestCombo);
        nextStats.totalEndlessRuns = (currentStats.totalEndlessRuns || 0) + 1;
      }
      nextStats.rushMilestoneChestsAwarded = [
        ...new Set([
          ...normalizeStringArray(currentStats.rushMilestoneChestsAwarded),
          ...milestoneRewards.map((reward) => reward.milestone.id),
        ]),
      ];
      nextStats.rushHistory = [historyEntry, ...(currentStats.rushHistory || [])].slice(0, 5);
    }

    const achievementUpdate = applyAchievementUnlocks(nextStats, currentStats);
    nextStats = achievementUpdate.nextStats;
    const nextResult = {
      ...baseResult,
      dailyRushStreak: endingDailyRush ? nextDailyRushStreak : baseResult.dailyRushStreak,
      newAchievements: achievementUpdate.newAchievements,
    };

    setIsComplete(true);
    setResult(nextResult);
    setFeedback(endingDailyRush ? 'Daily Rush complete.' : 'Rush complete.');
    saveStats(nextStats);
    setStats(nextStats);
  }

  function continueRushAfterReveal() {
    if (!isRush || isComplete) {
      return;
    }

    if (rushReveal?.endRun || rushLives <= 0 || (rushIsTimed && rushTimeLeft <= 0) || rushRunShouldFinishAfterReveal) {
      endRush();
      return;
    }

    advanceRushPuzzle(rushStats.solved, rushUsedPuzzleIds);
  }

  function finishEndlessPuzzle({ reason, skipped = false }) {
    const nextPuzzleMistakes = skipped ? rushPuzzleMistakes : rushPuzzleMistakes + 1;
    const nextUsedPuzzleIds = [...rushUsedPuzzleIds, puzzle.id];
    const nextOutcomes = [
      ...rushPuzzleOutcomes,
      {
        id: puzzle.id,
        status: skipped ? 'skipped' : 'missed',
        wrongMoveCount: nextPuzzleMistakes,
      },
    ];
    const nextRushStats = {
      ...rushStats,
      mistakes: rushStats.mistakes + (skipped ? 0 : 1),
      misses: rushStats.misses + (skipped ? 0 : 1),
      skips: rushStats.skips + (skipped ? 1 : 0),
      currentCombo: 0,
      totalScore: skipped ? Math.max(0, rushStats.totalScore - SKIP_PENALTY) : rushStats.totalScore,
    };

    if (!skipped) {
      setMistakes((value) => value + 1);
    }

    setRushPuzzleMistakes(nextPuzzleMistakes);
    setRushStats(nextRushStats);
    setRushLives(0);
    setRushUsedPuzzleIds(nextUsedPuzzleIds);
    setRushPuzzleOutcomes(nextOutcomes);
    setRushMissedPuzzles((items) => [
      ...items,
      getRushReviewItem(puzzle, reason, { wrongMoveCount: nextPuzzleMistakes }),
    ]);
    setSelectedSquare(null);
    setRushReveal({ reason, wrongMoveCount: nextPuzzleMistakes, endRun: true });
    setFeedback(skipped
      ? 'Skipped. Endless run over. Correct line shown.'
      : 'Wrong move. Endless run over. Correct line shown.');
  }

  function skipRushPuzzle() {
    if (!isRush || isComplete || (rushIsTimed && rushTimeLeft <= 0) || rushLives <= 0 || rushReveal) {
      return;
    }

    if (isEndlessRush) {
      finishEndlessPuzzle({ reason: 'Skipped', skipped: true });
      return;
    }

    const nextUsedPuzzleIds = [...rushUsedPuzzleIds, puzzle.id];
    const nextLives = Math.max(0, rushLives - 1);
    const nextOutcomes = [
      ...rushPuzzleOutcomes,
      {
        id: puzzle.id,
        status: 'skipped',
        wrongMoveCount: rushPuzzleMistakes,
      },
    ];

    setRushMissedPuzzles((items) => [
      ...items,
      getRushReviewItem(puzzle, 'Skipped', { wrongMoveCount: rushPuzzleMistakes }),
    ]);
    setRushStats((currentStats) => ({
      ...currentStats,
      skips: currentStats.skips + 1,
      currentCombo: 0,
      totalScore: Math.max(0, currentStats.totalScore - SKIP_PENALTY),
    }));
    setRushLives(nextLives);
    setRushUsedPuzzleIds(nextUsedPuzzleIds);
    setRushPuzzleOutcomes(nextOutcomes);
    if (rushIsTimed) {
      setRushTimeLeft((value) => Math.max(0, value - RUSH_SKIP_TIME_PENALTY));
    }
    setSelectedSquare(null);
    setRushReveal({ reason: 'Skipped', wrongMoveCount: rushPuzzleMistakes });
    setFeedback(nextLives === 0
      ? 'Skipped. No lives left. Correct line shown.'
      : `Skipped. Correct line shown. -100 score${rushIsTimed ? `, -${RUSH_SKIP_TIME_PENALTY} seconds` : ''}.`);
  }

  function ladderNodeRunShouldEnd(
    nextStats = ladderNodeStats,
    nextLives = ladderNodeLives,
    nextCursor = ladderNodeCursor + 1,
  ) {
    if (!activeLadderNode) {
      return true;
    }

    if (activeLadderNode.type === 'boss' && nextStats.solved >= activeLadderNode.clearRequirement) {
      return true;
    }

    if (activeLadderNode.lives && nextLives <= 0) {
      return true;
    }

    if (nextCursor >= ladderNodeQueue.length) {
      return true;
    }

    const remainingPuzzles = ladderNodeQueue.length - nextCursor;
    return nextStats.solved + remainingPuzzles < activeLadderNode.clearRequirement;
  }

  function finishLadderNodeRun({
    nextStats = ladderNodeStats,
    nextLives = ladderNodeLives,
  } = {}) {
    if (!activeLadderNode) {
      return;
    }

    const cleared = nextStats.solved >= activeLadderNode.clearRequirement;
    const completedNodeIds = stats.completedLadderNodes || [];
    const alreadyCompleted = completedNodeIds.includes(activeLadderNode.id);
    const nextCompletedNodeIds = cleared && !alreadyCompleted
      ? [...completedNodeIds, activeLadderNode.id]
      : completedNodeIds;
    const activeZone = getLadderZoneById(activeLadderNode.zoneId);
    const activeZoneNodes = getLadderZoneNodes(activeLadderNode.zoneId);
    const nextProgress = getLadderZoneProgress(activeLadderNode.zoneId, nextCompletedNodeIds);
    const nodeIndex = activeZoneNodes.findIndex((node) => node.id === activeLadderNode.id);
    const nextNode = cleared ? activeZoneNodes[nodeIndex + 1] || null : null;
    const nextZone = activeLadderNode.type === 'boss' ? getNextLadderZone(activeLadderNode.zoneId) : null;
    const nextZoneUnlocked = nextZone ? ladderZoneIsUnlocked(nextZone.id, nextCompletedNodeIds) : false;
    const rewardXp = cleared && !alreadyCompleted ? activeLadderNode.rewardXp : 0;
    const shouldAwardRewards = cleared && !alreadyCompleted;
    const earnedBadge = cleared && activeLadderNode.rewardBadge && !alreadyCompleted
      ? activeLadderNode.rewardBadge
      : '';
    const currentOwnedCollectionItems = normalizeOwnedCollectionItems(stats.ownedCollectionItems);
    const currentOwnedCollectionItemIds = new Set(currentOwnedCollectionItems);
    const bossCollectionRewardItem = activeLadderNode.rewardCollectionItemId
      ? getCollectionItemById(activeLadderNode.rewardCollectionItemId)
      : null;
    const shouldAwardBossCollectionItem = shouldAwardRewards
      && bossCollectionRewardItem
      && !currentOwnedCollectionItemIds.has(bossCollectionRewardItem.collectionItemId);
    const earnedChest = shouldAwardRewards && activeLadderNode.rewardChestTypeId
      ? createLadderChestReward({
          chestTypeId: activeLadderNode.rewardChestTypeId,
          nodeId: activeLadderNode.id,
          nodeTitle: activeLadderNode.title,
          zoneName: activeZone.name,
        })
      : shouldAwardRewards && activeLadderNode.rewardCollectionItemId && !shouldAwardBossCollectionItem
        ? createLadderChestReward({
            chestTypeId: activeLadderNode.fallbackChestTypeId || 'royal-chest',
            nodeId: activeLadderNode.id,
            nodeTitle: activeLadderNode.title,
            zoneName: activeZone.name,
            bonusReason: bossCollectionRewardItem
              ? `${bossCollectionRewardItem.displayName} already owned`
              : 'Collection reward unavailable',
          })
        : null;
    const collectionRewardItem = shouldAwardBossCollectionItem ? bossCollectionRewardItem : null;
    const previousCollectionSetProgress = collectionRewardItem
      ? getCollectionSetProgress(collectionRewardItem.setId, currentOwnedCollectionItems)
      : null;
    const collectionSetProgress = collectionRewardItem
      ? getCollectionSetProgress(
          collectionRewardItem.setId,
          [...currentOwnedCollectionItems, collectionRewardItem.collectionItemId],
        )
      : null;
    const collectionSetJustCompleted = Boolean(
      collectionRewardItem && !previousCollectionSetProgress?.isComplete && collectionSetProgress?.isComplete,
    );

    const nextResult = {
      mode: 'ladderNode',
      zoneId: activeLadderNode.zoneId,
      zoneName: activeZone.name,
      nodeId: activeLadderNode.id,
      nodeTitle: activeLadderNode.title,
      nodeType: activeLadderNode.type,
      cleared,
      alreadyCompleted,
      solved: nextStats.solved,
      misses: nextStats.misses,
      mistakes: nextStats.mistakes,
      totalPuzzles: activeLadderNode.puzzleCount,
      livesRemaining: activeLadderNode.lives ? nextLives : null,
      rewardXp,
      earnedBadge,
      earnedChest,
      collectionRewardItem,
      collectionSetProgress,
      collectionSetJustCompleted,
      progressCompleted: nextProgress.completedCount,
      progressTotal: nextProgress.totalCount,
      nextNodeId: nextNode?.id || '',
      nextNodeTitle: nextNode?.title || '',
      nextZoneId: nextZoneUnlocked ? nextZone.id : '',
      nextZoneName: nextZoneUnlocked ? nextZone.name : '',
      zoneCompleteMessage: cleared && activeLadderNode.type === 'boss' ? `${activeZone.name} complete` : '',
      campaignCompleteMessage: cleared && activeLadderNode.id === 'grandmaster-trial'
        ? 'You cleared the first QuickMate campaign.'
        : '',
      comingSoon: cleared && activeLadderNode.type === 'boss' && nextZone && !nextZoneUnlocked ? nextZone.name : '',
    };

    setIsComplete(true);
    setResult(nextResult);
    setCinematicMoment(
      nextResult.cleared && nextResult.nodeType === 'boss'
        ? createBossCinematicMoment(nextResult)
        : null,
    );
    setFeedback(cleared
      ? (activeLadderNode.type === 'boss' ? 'Boss defeated.' : 'Node clear.')
      : 'Node failed. Try again.');

    if (!cleared) {
      return;
    }

    setStats((currentStats) => {
      const currentCompletedNodeIds = normalizeStringArray(currentStats.completedLadderNodes);
      const nodeAlreadyCompleted = currentCompletedNodeIds.includes(activeLadderNode.id);
      const currentLadderBadges = normalizeStringArray(currentStats.ladderBadges);
      const nextUnopenedChests = normalizeUnopenedChests(currentStats.unopenedChests);
      const nextOwnedCollectionItems = normalizeOwnedCollectionItems(currentStats.ownedCollectionItems);
      const nextLadderBadges = activeLadderNode.rewardBadge
        && !currentLadderBadges.includes(activeLadderNode.rewardBadge)
        && !nodeAlreadyCompleted
        ? [...currentLadderBadges, activeLadderNode.rewardBadge]
        : currentLadderBadges;
      const nodeRewardChest = !nodeAlreadyCompleted ? earnedChest : null;
      const nodeRewardCollectionItem = !nodeAlreadyCompleted && activeLadderNode.rewardCollectionItemId
        ? getCollectionItemById(activeLadderNode.rewardCollectionItemId)
        : null;
      const collectionItemAlreadyOwned = nodeRewardCollectionItem
        ? nextOwnedCollectionItems.includes(nodeRewardCollectionItem.collectionItemId)
        : false;
      const updatedOwnedCollectionItems = nodeRewardCollectionItem && !collectionItemAlreadyOwned
        ? [...nextOwnedCollectionItems, nodeRewardCollectionItem.collectionItemId]
        : nextOwnedCollectionItems;
      const fallbackChest = nodeRewardCollectionItem && collectionItemAlreadyOwned && !nodeRewardChest
        ? createLadderChestReward({
            chestTypeId: activeLadderNode.fallbackChestTypeId || 'royal-chest',
            nodeId: activeLadderNode.id,
            nodeTitle: activeLadderNode.title,
            zoneName: activeZone.name,
            bonusReason: `${nodeRewardCollectionItem.displayName} already owned`,
          })
        : null;
      const storedChest = nodeRewardChest || fallbackChest;
      const updatedUnopenedChests = storedChest
        && !nextUnopenedChests.some((savedChest) => savedChest.chestId === storedChest.chestId)
        ? [...nextUnopenedChests, storedChest]
        : nextUnopenedChests;
      const updatedCompletedNodeIds = nodeAlreadyCompleted
        ? currentCompletedNodeIds
        : [...currentCompletedNodeIds, activeLadderNode.id];
      const unlockedNextZone = activeLadderNode.type === 'boss'
        ? getNextLadderZone(activeLadderNode.zoneId)
        : null;
      const nextCurrentZone = unlockedNextZone && ladderZoneIsUnlocked(unlockedNextZone.id, updatedCompletedNodeIds)
        ? unlockedNextZone.id
        : activeLadderNode.zoneId;
      const nextStatsValue = {
        ...currentStats,
        completedLadderNodes: updatedCompletedNodeIds,
        currentZone: nextCurrentZone,
        ladderXp: (currentStats.ladderXp || 0) + (nodeAlreadyCompleted ? 0 : activeLadderNode.rewardXp),
        ladderBadges: nextLadderBadges,
        ownedCollectionItems: updatedOwnedCollectionItems,
        unopenedChests: updatedUnopenedChests,
        collectionStats: getCollectionStatsSummary(
          updatedOwnedCollectionItems,
          updatedUnopenedChests,
          currentStats.collectionStats,
        ),
      };
      const achievementUpdate = applyAchievementUnlocks(nextStatsValue, currentStats);

      saveStats(achievementUpdate.nextStats);
      return achievementUpdate.nextStats;
    });
  }

  function advanceLadderNodePuzzle(nextFeedback = 'Find the forcing move.') {
    const nextCursor = ladderNodeCursor + 1;

    if (nextCursor >= ladderNodeQueue.length) {
      finishLadderNodeRun();
      return;
    }

    setLadderNodeCursor(nextCursor);
    resetPuzzle(ladderNodeQueue[nextCursor], 'ladderNode', nextFeedback);
  }

  function continueLadderNodeAfterReveal() {
    if (!isLadderNode || isComplete) {
      return;
    }

    if (ladderNodeRunShouldEnd(ladderNodeStats, ladderNodeLives, ladderNodeCursor + 1)) {
      finishLadderNodeRun();
      return;
    }

    advanceLadderNodePuzzle();
  }

  function skipLadderNodePuzzle() {
    if (!isLadderNode || isComplete || ladderNodeReveal) {
      return;
    }

    const nextLives = activeLadderNode?.lives ? Math.max(0, ladderNodeLives - 1) : ladderNodeLives;
    const nextStats = {
      ...ladderNodeStats,
      misses: ladderNodeStats.misses + 1,
    };

    setLadderNodeStats(nextStats);
    setLadderNodeLives(nextLives);
    setSelectedSquare(null);
    setLadderNodeReveal({ reason: 'Skipped', wrongMoveCount: ladderNodePuzzleMistakes });
    setFeedback(activeLadderNode?.lives && nextLives === 0
      ? 'Skipped. No lives left. Correct line shown.'
      : 'Skipped. Correct line shown.');
  }

  function updateStatsForSolve(nextResult) {
    setStats((currentStats) => {
      const bestTime = currentStats.bestTimeByPuzzleId[puzzle.id];
      const previousCompletion = currentStats.puzzleCompletions[puzzle.id];
      const isPerfect = nextResult.mistakes === 0 && nextResult.hints === 0;
      const bestPuzzleScore = Math.max(previousCompletion?.bestScore || 0, nextResult.score);
      const bestPuzzleTime = previousCompletion?.bestTime
        ? Math.min(previousCompletion.bestTime, nextResult.seconds)
        : nextResult.seconds;
      const nextStats = {
        ...currentStats,
        puzzlesSolved: currentStats.puzzlesSolved + 1,
        perfectSolves: currentStats.perfectSolves + (isPerfect ? 1 : 0),
        bestScore: Math.max(currentStats.bestScore, nextResult.score),
        bestTimeByPuzzleId: {
          ...currentStats.bestTimeByPuzzleId,
          [puzzle.id]: bestTime ? Math.min(bestTime, nextResult.seconds) : nextResult.seconds,
        },
        puzzleCompletions: {
          ...currentStats.puzzleCompletions,
          [puzzle.id]: {
            status: isPerfect || previousCompletion?.perfect ? 'perfect' : 'solved',
            solved: true,
            perfect: Boolean(isPerfect || previousCompletion?.perfect),
            bestScore: bestPuzzleScore,
            bestTime: bestPuzzleTime,
            lastScore: nextResult.score,
            lastTime: nextResult.seconds,
            solvedAt: new Date().toISOString(),
          },
        },
      };

      if (mode === 'daily' && currentStats.completedDailyPuzzleDate !== todayKey) {
        nextStats.completedDailyPuzzleDate = todayKey;
        nextStats.currentDailyStreak =
          currentStats.completedDailyPuzzleDate === getYesterdayKey(todayKey)
            ? currentStats.currentDailyStreak + 1
            : 1;
      }

      saveStats(nextStats);
      return nextStats;
    });
  }

  function finalizeSolve() {
    const scoreBreakdown = calculateScore({
      mateIn,
      mistakes,
      hints,
      seconds,
    });
    const nextResult = {
      ...scoreBreakdown,
      puzzleId: puzzle.id,
      puzzleTitle: puzzle.title,
      mateIn,
      mistakes,
      hints,
      seconds,
      mode,
      date: mode === 'daily' ? todayKey : '',
    };

    setResult(nextResult);
    updateStatsForSolve(nextResult);
  }

  function completeRushPuzzle() {
    const isPerfectSolve = mistakes === 0;
    const isFastSolve = seconds <= getFastSolveTarget(mateIn);
    const nextCombo = isPerfectSolve ? rushStats.currentCombo + 1 : rushStats.currentCombo;
    const scoreBreakdown = isEndlessRush
      ? calculateEndlessSolveScore({
          puzzle,
          depth: rushStats.solved + 1,
          streak: nextCombo,
        })
      : calculateScore({
          mateIn,
          mistakes,
          hints: 0,
          seconds,
        });
    const nextResult = {
      ...scoreBreakdown,
      puzzleId: puzzle.id,
      puzzleTitle: puzzle.title,
      mateIn,
      mistakes,
      hints: 0,
      seconds,
      mode: 'rush',
    };
    const multiplier = isEndlessRush ? scoreBreakdown.streakMultiplier : getRushMultiplier(nextCombo);
    const awardedScore = isEndlessRush ? scoreBreakdown.score : Math.round(scoreBreakdown.score * multiplier);
    const timeBonus = rushIsTimed ? (isPerfectSolve ? 5 : 0) + (isFastSolve ? 3 : 0) : 0;
    const feedbackParts = isEndlessRush
      ? [
          `Depth ${rushStats.solved + 1}`,
          `+${awardedScore} points`,
          `${multiplier.toFixed(2)}x streak`,
        ]
      : [
          `+${awardedScore} points`,
          `${multiplier.toFixed(2)}x`,
          `combo ${nextCombo}`,
        ];

    if (timeBonus > 0) {
      feedbackParts.push(`+${timeBonus} seconds`);
    }

    updateStatsForSolve(nextResult);
    const nextRushStats = {
      ...rushStats,
      solved: rushStats.solved + 1,
      perfectSolves: rushStats.perfectSolves + (isPerfectSolve ? 1 : 0),
      currentCombo: nextCombo,
      bestCombo: Math.max(rushStats.bestCombo, nextCombo),
      totalScore: rushStats.totalScore + awardedScore,
      totalSolveSeconds: rushStats.totalSolveSeconds + seconds,
    };

    setRushStats(nextRushStats);
    if (timeBonus > 0) {
      setRushTimeLeft((value) => Math.min(activeRushModeConfig.durationSeconds, value + timeBonus));
    }

    const nextUsedPuzzleIds = [...rushUsedPuzzleIds, puzzle.id];
    const nextOutcomes = [
      ...rushPuzzleOutcomes,
      {
        id: puzzle.id,
        status: isPerfectSolve ? 'perfect' : 'solved',
        wrongMoveCount: rushPuzzleMistakes,
      },
    ];

    setRushUsedPuzzleIds(nextUsedPuzzleIds);
    setRushPuzzleOutcomes(nextOutcomes);
    if (isDailyRush && nextUsedPuzzleIds.length >= DAILY_RUSH_PUZZLE_COUNT) {
      endRush({
        rushStatsOverride: nextRushStats,
        usedPuzzleIdsOverride: nextUsedPuzzleIds,
        outcomesOverride: nextOutcomes,
      });
      return;
    }

    advanceRushPuzzle(rushStats.solved + 1, nextUsedPuzzleIds, feedbackParts.join(' | '));
  }

  function completeLadderNodePuzzle() {
    if (!activeLadderNode) {
      return;
    }

    const scoreBreakdown = calculateScore({
      mateIn,
      mistakes,
      hints,
      seconds,
    });
    const nextResult = {
      ...scoreBreakdown,
      puzzleId: puzzle.id,
      puzzleTitle: puzzle.title,
      mateIn,
      mistakes,
      hints,
      seconds,
      mode: 'ladderNode',
    };
    const nextStats = {
      ...ladderNodeStats,
      solved: ladderNodeStats.solved + 1,
    };

    updateStatsForSolve(nextResult);
    setLadderNodeStats(nextStats);

    if (ladderNodeRunShouldEnd(nextStats, ladderNodeLives, ladderNodeCursor + 1)) {
      finishLadderNodeRun({ nextStats });
      return;
    }

    advanceLadderNodePuzzle(`Solved. ${nextStats.solved}/${activeLadderNode.clearRequirement} needed.`);
  }

  function handleLadderNodeWrongLegalMove() {
    if (!activeLadderNode) {
      setFeedback(WRONG_LEGAL_MOVE_FEEDBACK);
      return;
    }

    const nextPuzzleMistakes = ladderNodePuzzleMistakes + 1;
    const isMissed = nextPuzzleMistakes >= RUSH_MAX_PUZZLE_ATTEMPTS;
    const nextLives = isMissed && activeLadderNode.lives ? Math.max(0, ladderNodeLives - 1) : ladderNodeLives;
    const nextStats = {
      ...ladderNodeStats,
      mistakes: ladderNodeStats.mistakes + 1,
      misses: ladderNodeStats.misses + (isMissed ? 1 : 0),
    };

    setMistakes((value) => value + 1);
    setLadderNodePuzzleMistakes(nextPuzzleMistakes);
    setLadderNodeStats(nextStats);

    if (!isMissed) {
      setFeedback(RUSH_FIRST_MISS_FEEDBACK);
      return;
    }

    setLadderNodeLives(nextLives);
    setSelectedSquare(null);
    setLadderNodeReveal({ reason: 'Missed', wrongMoveCount: nextPuzzleMistakes });
    setFeedback(activeLadderNode.lives && nextLives === 0
      ? 'Missed. No lives left. Correct line shown.'
      : 'Missed. Correct line shown.');
  }

  function copyResult() {
    if (!result) {
      return;
    }

    const resultText = result.mode === 'dailyRush'
      ? formatDailyRushShareText(result)
      : [
          result.mode === 'rush'
            ? `QuickMate ${result.rushModeLabel || 'Rush'}`
            : `QuickMate ${result.mode === 'daily' ? `Daily Warmup ${todayKey}` : puzzle.title}`,
          result.mode === 'rush' && result.isEndlessRush
            ? `${result.totalScore} points | depth ${result.endlessDepth} | ${Math.round((result.endlessAccuracy || 0) * 100)}% accuracy`
            : result.mode === 'rush'
            ? `${result.totalScore} points | ${result.solved} solved | ${result.misses} misses | ${result.skips} skips`
            : `${result.score} points in ${formatTime(result.seconds)}`,
          result.mode === 'rush' && result.isEndlessRush
            ? `${result.rank} | best depth ${result.bestEndlessDepth} | streak ${result.bestCombo}`
            : result.mode === 'rush'
            ? `${result.rank} | ${result.livesRemaining} lives | combo ${result.bestCombo} | avg ${formatTime(result.averageSolveTime)}`
            : `Mate in ${result.mateIn} | ${result.mistakes} mistakes | ${result.hints} hints`,
          'quickmate.local',
        ].join('\n');

    if (!navigator.clipboard?.writeText) {
      setCopyStatus('Copy unavailable');
      return;
    }

    navigator.clipboard.writeText(resultText)
      .then(() => {
        setCopyStatus('Copied');
      })
      .catch(() => {
        setCopyStatus('Copy failed');
      });
  }

  function copyPuzzleFeedback(item, feedbackKey) {
    const feedbackText = formatPuzzleFeedbackText(item, result?.rushModeLabel || getRushModeLabel(activeRushMode));

    if (!navigator.clipboard?.writeText) {
      setPuzzleFeedbackCopyStatus((currentStatus) => ({
        ...currentStatus,
        [feedbackKey]: 'Copy unavailable',
      }));
      return;
    }

    navigator.clipboard.writeText(feedbackText)
      .then(() => {
        setPuzzleFeedbackCopyStatus((currentStatus) => ({
          ...currentStatus,
          [feedbackKey]: 'Copied',
        }));
      })
      .catch(() => {
        setPuzzleFeedbackCopyStatus((currentStatus) => ({
          ...currentStatus,
          [feedbackKey]: 'Copy failed',
        }));
      });
  }

  function openEarnedChest(chestId = '') {
    const requestedChestId = typeof chestId === 'string' ? chestId : '';
    const earnedChests = Array.isArray(result?.earnedChests)
      ? result.earnedChests
      : result?.earnedChest
        ? [result.earnedChest]
        : [];
    const chest = requestedChestId
      ? earnedChests.find((earnedChestItem) => earnedChestItem.chestId === requestedChestId)
      : result?.earnedChest || earnedChests[0];

    if (!chest || chest.opened || chestOpenResult) {
      return;
    }

    openChestReward(chest);
  }

  function openStoredChest(chestId) {
    const chest = normalizeUnopenedChests(stats.unopenedChests)
      .find((savedChest) => savedChest.chestId === chestId);

    if (!chest || chestOpenResult) {
      return;
    }

    openChestReward(chest);
  }

  function openChestReward(chest) {
    const ownedCollectionItems = normalizeOwnedCollectionItems(stats.ownedCollectionItems);
    const unopenedChests = normalizeUnopenedChests(stats.unopenedChests)
      .filter((savedChest) => savedChest.chestId !== chest.chestId);
    const unlockedItem = getRandomUnownedCollectionItem(ownedCollectionItems);
    const previousSetProgress = unlockedItem
      ? getCollectionSetProgress(unlockedItem.setId, ownedCollectionItems)
      : null;
    const nextOwnedCollectionItems = unlockedItem
      ? [...ownedCollectionItems, unlockedItem.collectionItemId]
      : ownedCollectionItems;
    const nextSetProgress = unlockedItem
      ? getCollectionSetProgress(unlockedItem.setId, nextOwnedCollectionItems)
      : null;
    const previousCollectionStats = {
      ...DEFAULT_COLLECTION_STATS,
      ...stats.collectionStats,
    };
    const nextCollectionStats = getCollectionStatsSummary(
      nextOwnedCollectionItems,
      unopenedChests,
      {
        ...previousCollectionStats,
        chestsOpened: previousCollectionStats.chestsOpened + 1,
        piecesUnlocked: unlockedItem
          ? Math.max(previousCollectionStats.piecesUnlocked || 0, nextOwnedCollectionItems.length)
          : previousCollectionStats.piecesUnlocked || 0,
      },
    );
    const baseNextStats = {
      ...stats,
      ownedCollectionItems: nextOwnedCollectionItems,
      unopenedChests,
      collectionStats: nextCollectionStats,
    };
    const achievementUpdate = applyAchievementUnlocks(baseNextStats, stats);
    const nextStats = achievementUpdate.nextStats;

    saveStats(nextStats);
    setStats(nextStats);
    setResult((currentResult) => currentResult
      ? {
          ...currentResult,
          earnedChest: currentResult.earnedChest?.chestId === chest.chestId
            ? {
                ...currentResult.earnedChest,
                opened: true,
              }
            : currentResult.earnedChest,
          earnedChests: Array.isArray(currentResult.earnedChests)
            ? currentResult.earnedChests.map((earnedChestItem) => (
                earnedChestItem.chestId === chest.chestId
                  ? {
                      ...earnedChestItem,
                      opened: true,
                    }
                  : earnedChestItem
              ))
            : currentResult.earnedChests,
        }
      : currentResult);
    setChestOpenResult({
      chest,
      unlockedItem,
      previousSetProgress,
      setProgress: nextSetProgress,
      setJustCompleted: Boolean(unlockedItem && !previousSetProgress?.isComplete && nextSetProgress?.isComplete),
      completeMessage: unlockedItem ? '' : 'Collection complete for current set pool',
      newAchievements: achievementUpdate.newAchievements,
    });
  }

  function finishIfSolved(nextGame, nextIndex, nextLog) {
    const solvedLine = nextIndex >= puzzle.solution.length;
    const checkmate = nextGame.isCheckmate();

    if (solvedLine && checkmate) {
      if (isRush) {
        setMoveLog(nextLog);
        setFeedback('Checkmate. Loading next puzzle.');
        completeRushPuzzle();
        return;
      }

      if (isLadderNode) {
        setMoveLog(nextLog);
        setFeedback('Checkmate. Loading next puzzle.');
        completeLadderNodePuzzle();
        return;
      }

      setIsComplete(true);
      setFeedback('Checkmate completed.');
      finalizeSolve();
    } else if (solvedLine) {
      if (isRush) {
        setMoveLog(nextLog);
        setFeedback('Line complete. Loading next puzzle.');
        completeRushPuzzle();
        return;
      }

      if (isLadderNode) {
        setMoveLog(nextLog);
        setFeedback('Line complete. Loading next puzzle.');
        completeLadderNodePuzzle();
        return;
      }

      setIsComplete(true);
      setFeedback('Solution line completed.');
      finalizeSolve();
    } else {
      setFeedback('Correct. Continue the line.');
    }

    setMoveLog(nextLog);
  }

  function handleWrongLegalMove() {
    if (puzzleBehavior === PUZZLE_BEHAVIOR.strictMode && isRush) {
      if (isEndlessRush) {
        finishEndlessPuzzle({ reason: 'Missed' });
        return;
      }

      const nextPuzzleMistakes = rushPuzzleMistakes + 1;
      const isMissed = nextPuzzleMistakes >= RUSH_MAX_PUZZLE_ATTEMPTS;
      const nextLives = isMissed ? Math.max(0, rushLives - 1) : rushLives;

      setMistakes((value) => value + 1);
      setRushPuzzleMistakes(nextPuzzleMistakes);
      setRushStats((currentStats) => ({
        ...currentStats,
        mistakes: currentStats.mistakes + 1,
        misses: currentStats.misses + (isMissed ? 1 : 0),
        currentCombo: 0,
      }));

      if (rushIsTimed) {
        setRushTimeLeft((value) => Math.max(0, value - RUSH_WRONG_MOVE_TIME_PENALTY));
      }

      if (!isMissed) {
        setFeedback(RUSH_FIRST_MISS_FEEDBACK);
        return;
      }

      const nextUsedPuzzleIds = [...rushUsedPuzzleIds, puzzle.id];
      const nextOutcomes = [
        ...rushPuzzleOutcomes,
        {
          id: puzzle.id,
          status: 'missed',
          wrongMoveCount: nextPuzzleMistakes,
        },
      ];

      setRushMissedPuzzles((items) => [
        ...items,
        getRushReviewItem(puzzle, 'Missed', { wrongMoveCount: nextPuzzleMistakes }),
      ]);
      setRushLives(nextLives);
      setRushUsedPuzzleIds(nextUsedPuzzleIds);
      setRushPuzzleOutcomes(nextOutcomes);
      setSelectedSquare(null);
      setRushReveal({ reason: 'Missed', wrongMoveCount: nextPuzzleMistakes });
      setFeedback(nextLives === 0
        ? 'Missed. No lives left. Correct line shown.'
        : 'Missed. Correct line shown. -1 life.');
      return;
    }

    if (puzzleBehavior === PUZZLE_BEHAVIOR.strictMode && isLadderNode) {
      handleLadderNodeWrongLegalMove();
      return;
    }

    setFeedback(WRONG_LEGAL_MOVE_FEEDBACK);
  }

  function attemptMove(sourceSquare, targetSquare) {
    setSelectedSquare(null);

    if (!boardIsInteractive || !sourceSquare || !targetSquare) {
      return false;
    }

    const currentGame = new Chess(fen);
    let attemptedMove = null;

    try {
      attemptedMove = currentGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });
    } catch {
      attemptedMove = null;
    }

    if (!attemptedMove) {
      setFeedback(ILLEGAL_MOVE_FEEDBACK);
      return false;
    }

    if (!moveMatches(attemptedMove, expectedMove)) {
      handleWrongLegalMove();
      return false;
    }

    let nextIndex = solutionIndex + 1;
    const nextGame = new Chess(fen);
    const playerMove = playExpectedMove(nextGame, expectedMove);
    const nextLog = [
      ...moveLog,
      {
        san: playerMove.san,
        side: playerMove.color === 'w' ? 'White' : 'Black',
      },
    ];

    if (nextIndex < puzzle.solution.length) {
      const opponentMove = playExpectedMove(nextGame, puzzle.solution[nextIndex]);
      nextIndex += 1;
      nextLog.push({
        san: opponentMove.san,
        side: opponentMove.color === 'w' ? 'White' : 'Black',
      });
    }

    setFen(nextGame.fen());
    setSolutionIndex(nextIndex);
    finishIfSolved(nextGame, nextIndex, nextLog);
    return true;
  }

  function onPieceDrop({ sourceSquare, targetSquare }) {
    return attemptMove(sourceSquare, targetSquare);
  }

  function onSquareClick({ piece, square }) {
    if (!boardIsInteractive) {
      setSelectedSquare(null);
      return;
    }

    if (!selectedSquare) {
      if (piece?.pieceType?.startsWith(game.turn())) {
        setSelectedSquare(square);
        setFeedback(`Selected ${square}. Choose a target square.`);
      }
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      setFeedback('Selection cleared.');
      return;
    }

    if (attemptMove(selectedSquare, square)) {
      return;
    }

    if (piece?.pieceType?.startsWith(game.turn())) {
      setSelectedSquare(square);
      setFeedback(`Selected ${square}. Choose a target square.`);
    }
  }

  function canDragPiece({ piece }) {
    return boardIsInteractive && piece?.pieceType?.startsWith(game.turn());
  }

  function showHint() {
    if (!expectedMove || isComplete) {
      return;
    }

    setHints((value) => value + 1);
    setFeedback(`Hint: play ${describeMove(expectedMove, game)}.`);
  }

  function goHome() {
    setIsComplete(false);
    setResult(null);
    setCopyStatus('Copy Result');
    setChestOpenResult(null);
    setCinematicMoment(null);
    setActiveLadderNodeId('');
    setScreen('home');
  }

  function dismissCinematicMoment() {
    setCinematicMoment(null);
  }

  function renderPuzzleItem(item, index) {
    const completion = stats.puzzleCompletions[item.id];
    const status = getPuzzleStatus(completion);

    return (
      <button
        type="button"
        key={item.id}
        className={`puzzle-item ${index === puzzleIndex ? 'active' : ''} ${status}`}
        onClick={() => {
          if (!isChallengeRun) {
            startPuzzle(index, mode === 'daily' ? 'daily' : 'ladder');
          }
        }}
        disabled={isChallengeRun}
      >
        <span>
          <strong>{item.title}</strong>
          <small>{formatTheme(getPuzzleThemes(item))}</small>
          <small className="completion-line">
            {status}
            {completion?.bestScore ? ` | best ${completion.bestScore}` : ''}
            {completion?.bestTime ? ` | ${formatTime(completion.bestTime)}` : ''}
          </small>
        </span>
        <span className="rating">{item.rating}</span>
      </button>
    );
  }

  function toggleLadderSection(contentStatus) {
    setOpenLadderSections((currentSections) => ({
      ...currentSections,
      [contentStatus]: !currentSections[contentStatus],
    }));
  }

  function toggleLadderMateGroup(contentStatus, mateGroupKey) {
    const accordionKey = `${contentStatus}:${mateGroupKey}`;

    setOpenLadderMateGroups((currentGroups) => ({
      ...currentGroups,
      [accordionKey]: !currentGroups[accordionKey],
    }));
  }

  function renderLadderPuzzleList() {
    return ladderPuzzleSections.map((section) => {
      const sectionOpen = Boolean(openLadderSections[section.contentStatus]);

      return (
        <section className={`content-group ${sectionOpen ? 'open' : 'collapsed'}`} key={section.contentStatus}>
          <button
            type="button"
            className="content-title accordion-trigger"
            onClick={() => toggleLadderSection(section.contentStatus)}
            aria-expanded={sectionOpen}
          >
            <span>{section.label}</span>
            <span className="accordion-meta">
              <strong>{section.count}</strong>
              <ChevronRight className="accordion-icon" size={16} />
            </span>
          </button>
          {sectionOpen && (
            <div className="mate-group-list">
              {section.groups.map((mateGroup) => {
                const groupKey = `${section.contentStatus}:${mateGroup.key}`;
                const groupOpen = Boolean(openLadderMateGroups[groupKey]);

                return (
                  <section className={`puzzle-group ${groupOpen ? 'open' : 'collapsed'}`} key={groupKey}>
                    <button
                      type="button"
                      className="group-title accordion-trigger mate-trigger"
                      onClick={() => toggleLadderMateGroup(section.contentStatus, mateGroup.key)}
                      aria-expanded={groupOpen}
                    >
                      <span>{mateGroup.label}</span>
                      <span className="accordion-meta">
                        <strong>{mateGroup.items.length}</strong>
                        <ChevronRight className="accordion-icon" size={15} />
                      </span>
                    </button>
                    {groupOpen && (
                      <div className="group-items">
                        {mateGroup.items.map(({ item, index }) => renderPuzzleItem(item, index))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </section>
      );
    });
  }

  if (screen === 'home') {
    return (
      <main className="app-shell home-shell">
        <section className="home-hero" aria-label="QuickMate menu">
          <div className="brand-row home-brand-row">
            <div className="brand-lockup">
              {brandLogoStatus !== 'missing' && (
                <img
                  className={`brand-logo ${brandLogoStatus === 'loaded' ? 'ready' : ''}`}
                  src={BRAND_LOGO_SRC}
                  alt="QuickMate"
                  onLoad={() => setBrandLogoStatus('loaded')}
                  onError={() => setBrandLogoStatus('missing')}
                />
              )}
              {brandLogoStatus !== 'loaded' && (
                <div className="brand-wordmark-fallback" aria-label="QuickMate">
                  <span className="brand-mark-fallback">Q</span>
                  <span>QuickMate</span>
                </div>
              )}
              <p className="eyebrow">Premium chess arcade</p>
              <h1>Mate puzzles, fast.</h1>
              <p className="brand-tagline">{BRAND_TAGLINE}</p>
            </div>
            <div className="streak-pill">
              <Sparkles size={17} />
              <span>{stats.dailyRushStreak || 0} Daily Rush streak</span>
            </div>
          </div>

          <section className="primary-feature-section" aria-label="Primary QuickMate features">
            <div className="primary-feature-grid">
              <button type="button" className="mode-card rush-hero-card featured" onClick={openRushIntro}>
                <Zap size={30} />
                <span>
                  <strong>Rush Mode</strong>
                  <small>Blitz, Classic, Survival, or Endless | best rank {bestRushRank}</small>
                  <small>Primary arcade loop</small>
                </span>
                <Play size={24} />
              </button>

              <button
                type="button"
                className={`mode-card daily-rush-card ${dailyRushCompletedToday ? 'completed' : ''}`}
                onClick={startDailyRush}
                disabled={!hasDailyRushPuzzles}
              >
                <CalendarDays size={26} />
                <span>
                  <strong>Today's Daily Rush</strong>
                  <small>
                    {dailyRushStatusLabel} | streak {stats.dailyRushStreak || 0}
                  </small>
                  <small>
                    {dailyRushCompletedToday
                      ? `Official score ${dailyRushOfficialResult.score}`
                      : `${DAILY_RUSH_PUZZLE_COUNT} fixed puzzles | starts ${puzzles[todaysDailyRushSequence[0]]?.title || 'when ready'}`}
                  </small>
                </span>
                <Play size={22} />
              </button>

              <button type="button" className="mode-card ladder-campaign-card featured" onClick={openLadderWorld}>
                <ListChecks size={26} />
                <span>
                  <strong>Ladder World</strong>
                  <small>{ladderCampaignProgress.percent}% campaign | {ladderCampaignProgress.worldsCompleted}/{ladderCampaignProgress.totalWorlds} worlds complete</small>
                  <small>
                    {ladderCampaignComplete ? 'Campaign complete' : currentCampaignZone?.name || 'Campaign ready'}
                    {ladderCampaignComplete
                      ? ' | first campaign complete'
                      : nextCampaignZone
                        ? ` -> ${nextCampaignZone.name}`
                        : ' | final world'}
                  </small>
                  <small className="card-cta">Continue Campaign</small>
                </span>
                <Play size={22} />
              </button>

              <button type="button" className="mode-card collection-feature-card" onClick={openCollection}>
                <Trophy size={26} />
                <span>
                  <strong>Collection</strong>
                  <small>{collectionStats.totalPiecesOwned}/{COLLECTION_ITEMS.length} pieces | {collectionStats.setsCompleted} sets complete</small>
                  <small>Cosmetic/status rewards from Rush and Ladder</small>
                </span>
                <Play size={22} />
              </button>
            </div>
          </section>

          <section className="rush-overview-section" aria-label="Rush performance">
            <div className="rush-home-metrics">
              <div>
                <strong>{stats.bestBlitzRushScore || 0}</strong>
                <span>Best Blitz</span>
              </div>
              <div>
                <strong>{stats.bestClassicRushScore || 0}</strong>
                <span>Best Classic</span>
              </div>
              <div>
                <strong>{stats.bestSurvivalRushScore || 0}</strong>
                <span>Best Survival</span>
              </div>
              <div>
                <strong>{stats.bestEndlessDepth || 0}</strong>
                <span>Best Endless</span>
              </div>
              <div>
                <strong>{bestRushCombo}</strong>
                <span>Best Combo</span>
              </div>
            </div>

            <section className="rush-home-history" aria-label="Recent Rush runs">
              <div className="panel-header">
                <h2>Recent Rush Runs</h2>
                <span>{recentRushRuns.length}</span>
              </div>
              {recentRushRuns.length === 0 ? (
                <p className="empty-log">No Rush runs yet.</p>
              ) : (
                <div className="history-list">
                  {recentRushRuns.map((run) => (
                    <div className="history-item" key={`${run.date}-${run.score}`}>
                      <span>
                        <strong>{run.score}</strong>
                        <small>{run.rushModeLabel || getRushModeLabel(run.rushMode)}</small>
                      </span>
                      <span>
                        <strong>{run.solved}</strong>
                        <small>solved</small>
                      </span>
                      <span>
                        <strong>{run.bestCombo}</strong>
                        <small>{run.rank}</small>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </section>

          <section className="practice-section" aria-label="Practice">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Practice</p>
                <h2>Warm up and train.</h2>
              </div>
            </div>
            <div className="mode-grid practice-mode-grid">
              <button type="button" className="mode-card practice-card" onClick={startDaily}>
                <CalendarDays size={24} />
                <span>
                  <strong>Daily Warmup</strong>
                  <small>One quick puzzle to warm up before Rush.</small>
                  <small>{dailyDone ? `${stats.currentDailyStreak} warmup streak` : `Today: ${puzzles[dailyPuzzleIndex].title}`}</small>
                </span>
                <Play size={20} />
              </button>

              <button type="button" className="mode-card practice-card" onClick={() => startPuzzle(0, 'ladder')}>
                <ListChecks size={24} />
                <span>
                  <strong>Classic Ladder</strong>
                  <small>Browse candidate and development puzzle groups.</small>
                  <small>Accordion training list</small>
                </span>
                <Play size={20} />
              </button>
            </div>
          </section>

          <div className="home-stats" aria-label="Saved stats">
            <div>
              <strong>{stats.dailyRushStreak || 0}</strong>
              <span>Daily Rush streak</span>
            </div>
            <div>
              <strong>{ladderCampaignProgress.completedNodes}/{ladderCampaignProgress.totalNodes}</strong>
              <span>Campaign nodes</span>
            </div>
            <div>
              <strong>{stats.puzzlesSolved}</strong>
              <span>Total solved</span>
            </div>
            <div>
              <strong>{productionRushPuzzleCount}</strong>
              <span>Rush pool</span>
            </div>
          </div>

          <section className="about-panel" aria-label="About QuickMate">
            <button type="button" className="secondary-action" onClick={() => setShowHelp(true)}>
              <HelpCircle size={18} />
              How to Play
            </button>
            <div>
              <strong>QuickMate MVP</strong>
              <span>Puzzle Pack | {puzzles.length} puzzles</span>
            </div>
          </section>
        </section>
        {showHelp && (
          <section className="result-screen" role="dialog" aria-modal="true" aria-label="How to Play">
            <div className="result-panel help-panel">
              <HelpCircle size={42} />
              <p className="eyebrow">How to Play</p>
              <h2>Find the forced mate</h2>
              <div className="help-sections">
                <section className="help-section">
                  <h3>Goal</h3>
                  <ul className="help-list">
                    <li>You play the attacking side.</li>
                    <li>Find the forced checkmate.</li>
                    <li>QuickMate auto-plays opponent replies when you are on the correct line.</li>
                  </ul>
                </section>
                <section className="help-section">
                  <h3>Moves</h3>
                  <ul className="help-list">
                    <li>Illegal moves are rejected and do not count as mistakes.</li>
                    <li>Legal moves that do not force mate count as mistakes.</li>
                  </ul>
                </section>
                <section className="help-section">
                  <h3>Rush Mode</h3>
                  <ul className="help-list">
                    <li>Blitz Rush is 90 seconds with 2 lives for quick mate-in-1 to mate-in-3 puzzles.</li>
                    <li>Classic Rush is 120 seconds with 3 lives for mate-in-1 to mate-in-4 puzzles.</li>
                    <li>Survival Rush has 3 lives and no fixed countdown.</li>
                    <li>Endless Survival has no clock: one wrong legal move or skip ends the run.</li>
                    <li>Rush uses production-track puzzles only.</li>
                    <li>In Blitz, Classic, and Survival, the first wrong legal move breaks combo, costs 3 seconds in timed modes, and gives one more try.</li>
                    <li>In Blitz, Classic, and Survival, the second wrong legal move loses a life, marks the puzzle missed, reveals the correct line, and waits for Next Puzzle.</li>
                    <li>Endless Survival ramps from quick mates into harder, deeper puzzles as your depth climbs.</li>
                    <li>Skip loses a life in normal Rush modes. In Endless Survival, skip ends the run.</li>
                    <li>Perfect solves have no wrong moves and build combo multipliers.</li>
                    <li>Fast or perfect solves can add time in timed modes.</li>
                    <li>Survival starts easy and allows deeper mate sequences as you solve and as content expands.</li>
                  </ul>
                </section>
                <section className="help-section">
                  <h3>Daily Rush</h3>
                  <ul className="help-list">
                    <li>Daily Rush is a 10-puzzle fixed sequence based on today's local date.</li>
                    <li>Everyone playing the same date gets the same production-track puzzle sequence.</li>
                    <li>The first completed run of the day is official and can award one daily chest.</li>
                    <li>Practice replays are allowed after completion but do not replace the official result or award more daily chests.</li>
                    <li>Copy Daily Result shares score, solved count, rank, streak, and the outcome row.</li>
                  </ul>
                </section>
                <section className="help-section">
                  <h3>Daily Warmup and Ladder</h3>
                  <ul className="help-list">
                    <li>Daily Warmup is one quick puzzle to warm up before Rush.</li>
                    <li>Daily Warmup and Ladder are training modes.</li>
                    <li>Wrong legal moves count as mistakes, but you can keep trying.</li>
                  </ul>
                </section>
                <section className="help-section">
                  <h3>Scoring</h3>
                  <ul className="help-list">
                    <li>Score more for fast solves, perfect solves, harder puzzles, and Rush multipliers.</li>
                    <li>Wrong legal moves and Rush skips apply penalties.</li>
                  </ul>
                </section>
                <section className="help-section">
                  <h3>Review Missed</h3>
                  <ul className="help-list">
                    <li>Missed and skipped Rush puzzles show the correct line.</li>
                    <li>Review Missed helps you learn after the run.</li>
                  </ul>
                </section>
              </div>
              <button type="button" className="primary-action" onClick={() => setShowHelp(false)}>
                Got it
              </button>
            </div>
          </section>
        )}
      </main>
    );
  }

  if (screen === 'collection') {
    return (
      <main className="app-shell home-shell">
        <section className="home-hero collection-screen" aria-label="Collection">
          <div className="brand-row">
            <div>
              <p className="eyebrow">Collection</p>
              <h1>Build your chess sets.</h1>
            </div>
            <div className="streak-pill">
              <Trophy size={17} />
              <span>{collectionStats.totalPiecesOwned}/{COLLECTION_ITEMS.length} pieces</span>
            </div>
          </div>

          <section className="collection-intro" aria-label="Collection overview">
            <p>
              Collect pieces by playing Rush, clearing Ladder nodes, and defeating bosses.
              Collection rewards are cosmetic/status-based only.
            </p>
            <div className="collection-progress-summary">
              <div className="progress-copy">
                <span>Collection progress</span>
                <strong>{collectionCompletionPercent}%</strong>
              </div>
              <div className="progress-track">
                <span style={{ width: `${collectionCompletionPercent}%` }} />
              </div>
            </div>
          </section>

          <section className="collection-stats" aria-label="Collection stats">
            <div>
              <strong>{collectionStats.piecesUnlocked}</strong>
              <span>Pieces unlocked</span>
            </div>
            <div>
              <strong>{collectionStats.setsCompleted}</strong>
              <span>Sets completed</span>
            </div>
            <div>
              <strong>{collectionStats.chestsOpened}</strong>
              <span>Chests opened</span>
            </div>
            <div>
              <strong>{collectionStats.unopenedChests}</strong>
              <span>Unopened chests</span>
            </div>
            <div>
              <strong>{unlockedAchievements.length}/{ACHIEVEMENTS.length}</strong>
              <span>Achievements</span>
            </div>
            <div>
              <strong>{stats.rushGamesPlayed || 0}</strong>
              <span>Rush runs</span>
            </div>
          </section>

          {chestOpenResult && (
            <section
              className={`chest-open-result collection-chest-result ${chestOpenResult.setJustCompleted ? 'set-complete' : ''}`}
              aria-label="Chest opened"
            >
              {chestOpenResult.unlockedItem ? (
                <>
                  <div className="unlock-hero">
                    <div
                      className={`unlock-piece-emblem ${getRarityClassName(chestOpenResult.unlockedItem.rarity)}`}
                      aria-hidden="true"
                    >
                      {chestOpenResult.unlockedItem.pieceType.charAt(0)}
                    </div>
                    <div>
                      <p className="eyebrow">New Piece Unlocked</p>
                      <h3>{chestOpenResult.unlockedItem.displayName}</h3>
                      <div className="unlock-meta-row">
                        <span className={`rarity-pill ${getRarityClassName(chestOpenResult.unlockedItem.rarity)}`}>
                          {chestOpenResult.unlockedItem.rarity}
                        </span>
                        <span className="piece-type-pill">{chestOpenResult.unlockedItem.pieceType}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`set-progress-card ${chestOpenResult.setJustCompleted ? 'complete' : ''}`}>
                    <div>
                      <span>Set progress</span>
                      <strong>
                        {chestOpenResult.setProgress?.setName || chestOpenResult.unlockedItem.setName}:{' '}
                        {chestOpenResult.setProgress?.ownedCount ?? 0}/
                        {chestOpenResult.setProgress?.totalCount ?? 6}
                      </strong>
                    </div>
                    {chestOpenResult.setJustCompleted && (
                      <span className="set-complete-banner">Set Complete!</span>
                    )}
                  </div>
                  <div className="score-breakdown compact unlock-details" aria-label="Collection unlock details">
                    <div><span>Chest</span><strong>{chestOpenResult.chest.name}</strong></div>
                    <div><span>Chest rarity</span><strong>{chestOpenResult.chest.tier}</strong></div>
                    <div><span>Reward preview</span><strong>{chestOpenResult.unlockedItem.cosmeticReward}</strong></div>
                  </div>
                </>
              ) : (
                <>
                  <p className="eyebrow">Chest Opened</p>
                  <h3>{chestOpenResult.completeMessage}</h3>
                  <p className="rank-chase">No duplicate pieces are awarded in Collection Rewards v1.</p>
                </>
              )}
              {(chestOpenResult.newAchievements || []).length > 0 && (
                <div className="achievement-mini-list" aria-label="Achievements unlocked from chest">
                  {(chestOpenResult.newAchievements || []).map((achievement) => (
                    <span key={achievement.id}>
                      <BadgeCheck size={15} />
                      {achievement.name}
                    </span>
                  ))}
                </div>
              )}
            </section>
          )}

          {unopenedChestList.length > 0 && (
            <section className="unopened-chests-section" aria-label="Unopened chests">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Rewards</p>
                  <h2>Unopened chests</h2>
                </div>
                <span>{unopenedChestList.length}</span>
              </div>
              <div className="unopened-chest-list">
                {unopenedChestList.map((chest) => (
                  <article className="unopened-chest-card" key={chest.chestId}>
                    <div>
                      <strong>{chest.name}</strong>
                      <span>{chest.earnedFrom}</span>
                      {chest.bonusReason && <small>{chest.bonusReason}</small>}
                    </div>
                    <span className={`rarity-pill compact ${getRarityClassName(chest.tier)}`}>
                      {chest.tier}
                    </span>
                    <button
                      type="button"
                      className="primary-action"
                      onClick={() => openStoredChest(chest.chestId)}
                      disabled={Boolean(chestOpenResult)}
                    >
                      <Sparkles size={18} />
                      Open
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className="achievements-section" aria-label="Achievements">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Achievements</p>
                <h2>Retention goals</h2>
              </div>
              <span>{unlockedAchievements.length}/{ACHIEVEMENTS.length}</span>
            </div>
            <div className="achievement-list">
              {ACHIEVEMENTS.map((achievement) => {
                const unlocked = visibleAchievementIds.has(achievement.id);

                return (
                  <article
                    className={`achievement-card ${unlocked ? 'unlocked' : 'locked'}`}
                    key={achievement.id}
                  >
                    <div className="achievement-icon" aria-hidden="true">
                      {unlocked ? <BadgeCheck size={18} /> : <Trophy size={18} />}
                    </div>
                    <div>
                      <strong>{achievement.name}</strong>
                      <span>{achievement.description}</span>
                    </div>
                    <small>{unlocked ? 'Unlocked' : 'Locked'}</small>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="collection-grid" aria-label="Collectible piece sets">
            {PIECE_SETS.map((pieceSet) => {
              const ownedCount = pieceSet.pieces.filter((piece) => ownedCollectionItemIds.has(piece.collectionItemId)).length;
              const isComplete = ownedCount === pieceSet.pieces.length;

              return (
                <article
                  className={`collection-set-card ${isComplete ? 'unlocked completed' : 'locked'}`}
                  key={pieceSet.setId}
                >
                  <div className="collection-set-header">
                    <div>
                      <span className={`rarity-pill compact ${getRarityClassName(pieceSet.rarity)}`}>
                        {pieceSet.rarity}
                      </span>
                      <h2>{pieceSet.setName}</h2>
                    </div>
                    <span className="collection-progress">{ownedCount}/{pieceSet.pieces.length}</span>
                  </div>
                  {isComplete && <span className="set-complete-label">Set Complete!</span>}
                  <div className="collection-reward">
                    <span>Reward preview</span>
                    <strong>{pieceSet.cosmeticReward}</strong>
                  </div>
                  <div className="piece-slots" aria-label={`${pieceSet.setName} pieces`}>
                    {pieceSet.pieces.map((piece) => {
                      const pieceOwned = ownedCollectionItemIds.has(piece.collectionItemId);

                      return (
                        <div className={`piece-slot ${pieceOwned ? 'owned' : 'locked'}`} key={piece.collectionItemId}>
                          <span>{piece.pieceType.charAt(0)}</span>
                          <strong>{piece.pieceType}</strong>
                          <small>{pieceOwned ? 'Unlocked' : 'Locked'}</small>
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </section>

          <div className="actions">
            <button type="button" className="secondary-action" onClick={() => setScreen('home')}>
              <Home size={18} />
              Back Home
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (
    screen === 'pawnVillage'
    || screen === 'knightWoods'
    || screen === 'bishopTower'
    || screen === 'rookFortress'
    || screen === 'queensCourt'
    || screen === 'kingsGate'
    || screen === 'grandmasterKeep'
  ) {
    const ladderZoneId = screen === 'grandmasterKeep'
      ? GRANDMASTER_KEEP_ZONE_ID
      : screen === 'kingsGate'
        ? KINGS_GATE_ZONE_ID
        : screen === 'queensCourt'
          ? QUEENS_COURT_ZONE_ID
          : screen === 'rookFortress'
            ? ROOK_FORTRESS_ZONE_ID
            : screen === 'bishopTower'
              ? BISHOP_TOWER_ZONE_ID
              : screen === 'knightWoods'
                ? KNIGHT_WOODS_ZONE_ID
                : PAWN_VILLAGE_ZONE_ID;
    const ladderZone = getLadderZoneById(ladderZoneId);
    const ladderZoneNodes = getLadderZoneNodes(ladderZoneId);
    const ladderZoneProgress = getLadderZoneProgress(ladderZoneId, stats.completedLadderNodes || []);
    const ladderZoneBadge = getLadderZoneBadge(ladderZoneId);
    const hasLadderZoneBadge = ladderZoneBadge ? (stats.ladderBadges || []).includes(ladderZoneBadge) : false;
    const nextZone = getNextLadderZone(ladderZoneId);
    const nextCopy = ladderZoneProgress.isComplete
      ? nextZone && ladderZoneIsUnlocked(nextZone.id, stats.completedLadderNodes || [])
        ? `${nextZone.name} unlocked`
        : nextZone
          ? `${nextZone.name} coming soon`
          : 'World complete'
      : 'Clear the road';

    return (
      <main className="app-shell home-shell">
        <section className="home-hero pawn-village-screen ladder-zone-screen" aria-label={ladderZone.name}>
          <div className="brand-row">
            <div>
              <p className="eyebrow">Ladder World</p>
              <h1>{ladderZone.name}</h1>
            </div>
            <div className="streak-pill">
              <ListChecks size={17} />
              <span>{ladderZoneProgress.completedCount}/{ladderZoneProgress.totalCount} nodes cleared</span>
            </div>
          </div>

          <section className="world-summary" aria-label={`${ladderZone.name} summary`}>
            <div>
              <strong>{stats.ladderXp || 0}</strong>
              <span>Ladder XP</span>
            </div>
            <div>
              <strong>{hasLadderZoneBadge ? 'Earned' : 'Locked'}</strong>
              <span>{ladderZoneBadge || 'Zone Badge'}</span>
            </div>
            <div>
              <strong>Next</strong>
              <span>{nextCopy}</span>
            </div>
          </section>

          <section className="node-path" aria-label={`${ladderZone.name} nodes`}>
            {ladderZoneNodes.map((node, index) => {
              const cleared = completedLadderNodeIds.has(node.id);
              const unlocked = ladderNodeIsUnlocked(node.id, stats.completedLadderNodes || []);
              const queue = buildLadderNodeQueue(node.id);

              return (
                <article
                  className={`node-card ${node.type === 'boss' ? 'boss' : ''} ${cleared ? 'cleared' : ''} ${unlocked ? 'unlocked' : 'locked'}`}
                  key={node.id}
                >
                  <div className="node-index" aria-hidden="true">{index + 1}</div>
                  <div className="node-content">
                    <div className="node-header">
                      <div>
                        <p className="eyebrow">{node.type === 'boss' ? 'Boss Battle' : 'Puzzle Node'}</p>
                        <h2>{node.title}</h2>
                      </div>
                      <span className="zone-status">{cleared ? 'Cleared' : unlocked ? 'Unlocked' : 'Locked'}</span>
                    </div>
                    <p>{node.description}</p>
                    <div className="node-details">
                      <div><span>Puzzles</span><strong>{node.puzzleCount}</strong></div>
                      <div><span>Clear</span><strong>{node.clearRequirement}/{node.puzzleCount}</strong></div>
                      <div><span>Reward</span><strong>{getLadderNodeRewardLabel(node)}</strong></div>
                      {node.lives && <div><span>Lives</span><strong>{node.lives}</strong></div>}
                    </div>
                    <div className="zone-motifs" aria-label={`${node.title} motifs`}>
                      {node.motifs.map((motif) => (
                        <span key={motif}>{motif}</span>
                      ))}
                    </div>
                    {node.rewardBadge && (
                      <small className="zone-badge-earned">
                        {cleared ? `${node.rewardBadge} earned` : `Badge: ${node.rewardBadge}`}
                      </small>
                    )}
                    <button
                      type="button"
                      className={cleared ? 'secondary-action' : 'primary-action'}
                      onClick={() => startLadderNode(node.id)}
                      disabled={!unlocked || queue.length === 0}
                    >
                      <Play size={18} />
                      {cleared ? 'Replay Node' : node.type === 'boss' ? 'Start Boss' : 'Start Node'}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>

          <div className="actions world-actions">
            <button type="button" className="secondary-action" onClick={() => startPuzzle(0, 'ladder')}>
              <ListChecks size={18} />
              Open Classic Ladder List
            </button>
            <button type="button" className="secondary-action" onClick={() => setScreen('ladderWorld')}>
              <ChevronLeft size={18} />
              Back to World
            </button>
            <button type="button" className="secondary-action" onClick={() => setScreen('home')}>
              <Home size={18} />
              Back Home
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (screen === 'ladderWorld') {
    return (
      <main className="app-shell home-shell">
        <section className="home-hero ladder-world" aria-label="Ladder World map preview">
          <div className="brand-row">
            <div>
              <p className="eyebrow">Ladder World</p>
              <h1>Ladder World</h1>
              <p className="brand-tagline">Clear worlds, beat tactical boards, and unlock rewards.</p>
            </div>
            <div className="streak-pill">
              <ListChecks size={17} />
              <span>{ladderCampaignProgress.percent}% campaign</span>
            </div>
          </div>

          <section className="campaign-path-card" aria-label="Current campaign path">
            <div>
              <p className="eyebrow">Current Campaign Path</p>
              <strong>{ladderCampaignPath}</strong>
            </div>
            <span>
              Complete worlds to earn chests, badges, XP, and collection pieces.
              Perfect clears and future boss battles will unlock premium rewards.
            </span>
          </section>

          <section className="world-summary" aria-label="Ladder World summary">
            <div>
              <strong>{ladderCampaignProgress.completedNodes}/{ladderCampaignProgress.totalNodes}</strong>
              <span>Nodes completed</span>
            </div>
            <div>
              <strong>{ladderCampaignProgress.worldsCompleted}/{ladderCampaignProgress.totalWorlds}</strong>
              <span>Worlds completed</span>
            </div>
            <div>
              <strong>{ladderCampaignComplete ? 'Complete' : currentCampaignZone?.name || 'Ready'}</strong>
              <span>Current world</span>
            </div>
            <div>
              <strong>{ladderCampaignComplete ? 'Campaign complete' : nextCampaignZone?.name || 'Final world'}</strong>
              <span>Next world</span>
            </div>
            <div>
              <strong>{stats.ladderXp || 0}</strong>
              <span>Ladder XP</span>
            </div>
            <div>
              <strong>{ladderBadgesEarned}</strong>
              <span>Boss badges</span>
            </div>
            <div>
              <strong>{collectionStats.unopenedChests}</strong>
              <span>Unopened chests</span>
            </div>
            <div>
              <strong>{grandmasterKeepProgress.isComplete ? 'Complete' : grandmasterKeepUnlocked ? 'Open' : 'Locked'}</strong>
              <span>Campaign</span>
            </div>
          </section>
          {grandmasterKeepProgress.isComplete && (
            <p className="campaign-complete-banner">You cleared the first QuickMate campaign.</p>
          )}

          <section className="world-map" aria-label="Ladder World zones">
            {LADDER_WORLD_ZONES.map((zone, index) => {
              const zoneUnlocked = ladderZoneIsUnlocked(zone.id, stats.completedLadderNodes || []);
              const zoneProgress = getLadderZoneProgress(zone.id, stats.completedLadderNodes || []);
              const zoneProgressPercent = zoneProgress.totalCount > 0
                ? (zoneProgress.completedCount / zoneProgress.totalCount) * 100
                : 0;
              const zoneBadge = getLadderZoneBadge(zone.id);
              const hasZoneBadge = zoneBadge ? (stats.ladderBadges || []).includes(zoneBadge) : false;
              const zoneCanOpen = PLAYABLE_LADDER_ZONE_IDS.includes(zone.id);
              const zoneStatusLabel = zoneProgress.isComplete ? 'Completed' : zoneUnlocked ? 'Unlocked' : 'Locked';
              const zoneAchievementId = getLadderZoneAchievementId(zone.id);
              const zoneAchievement = zoneAchievementId ? getAchievementById(zoneAchievementId) : null;
              const zoneAchievementUnlocked = zoneAchievementId ? visibleAchievementIds.has(zoneAchievementId) : false;
              const zoneCtaLabel = zoneProgress.isComplete
                ? 'Review World'
                : currentCampaignZone?.id === zone.id
                  ? 'Continue Campaign'
                  : 'Open Zone';
              const zoneRewardCopy = zone.id === PAWN_VILLAGE_ZONE_ID
                ? 'Rewards: Basic and Tactical Chests, Bronze Rook boss reward, XP.'
                : zone.id === KNIGHT_WOODS_ZONE_ID
                  ? 'Rewards: Tactical and Royal Chests, Bronze Knight boss reward, XP.'
                  : zone.id === BISHOP_TOWER_ZONE_ID
                    ? 'Rewards: Tactical and Royal Chests, Shadow Bishop boss reward, XP.'
                    : zone.id === ROOK_FORTRESS_ZONE_ID
                      ? 'Rewards: Tactical and Royal Chests, Royal Rook boss reward, XP.'
                      : zone.id === QUEENS_COURT_ZONE_ID
                        ? "Rewards: Royal and Legendary Chests, Royal Queen boss reward, XP."
                        : zone.id === KINGS_GATE_ZONE_ID
                          ? "Rewards: Royal and Legendary Chests, Royal King boss reward, XP."
                          : zone.id === GRANDMASTER_KEEP_ZONE_ID
                            ? 'Rewards: Legendary Chests, Grandmaster King boss reward, XP.'
                          : '';

              return (
                <article
                  className={`zone-node ${zoneUnlocked ? 'unlocked' : 'locked'} ${zoneProgress.isComplete ? 'completed' : ''}`}
                  key={zone.id}
                  style={{ '--zone-color': zone.color }}
                >
                  <div className="zone-marker" aria-hidden="true">
                    <span>{index + 1}</span>
                  </div>
                  <div className="zone-card">
                    <div className="zone-card-header">
                      <div>
                        <p className="eyebrow">{zone.campaignLabel}</p>
                        <h2>{zone.name}</h2>
                        <small>{zone.mateInRange} | {zone.difficultyRange}</small>
                      </div>
                      <span className="zone-status">{zoneStatusLabel}</span>
                    </div>
                    <p>{zone.focus}</p>
                    <div className="zone-details">
                      <div>
                        <span>Completion</span>
                        <strong>{Math.round(zoneProgressPercent)}%</strong>
                      </div>
                      <div>
                        <span>Nodes</span>
                        <strong>{zoneProgress.completedCount}/{zoneProgress.totalCount}</strong>
                      </div>
                      <div className="zone-rewards-detail">
                        <span>Rewards</span>
                        <strong>{zone.rewardPreview}</strong>
                      </div>
                      <div>
                        <span>Boss</span>
                        <strong>{zone.bossName}</strong>
                      </div>
                    </div>
                    <div className="zone-motifs" aria-label={`${zone.name} puzzle motifs`}>
                      {zone.motifs.map((motif) => (
                        <span key={motif}>{motif}</span>
                      ))}
                    </div>
                    {zoneProgress.totalCount > 0 && (
                      <div className="zone-progress" aria-label={`${zone.name} progress`}>
                        <div className="progress-copy">
                          <span>Progress</span>
                          <strong>{zoneProgress.completedCount}/{zoneProgress.totalCount}</strong>
                        </div>
                        <div className="progress-track">
                          <span style={{ width: `${zoneProgressPercent}%` }} />
                        </div>
                        {hasZoneBadge && <small className="zone-badge-earned">{zoneBadge} earned</small>}
                        {zoneAchievement && (
                          <small className={`zone-achievement-status ${zoneAchievementUnlocked ? 'earned' : ''}`}>
                            {zoneAchievementUnlocked ? 'Achievement earned' : 'Achievement locked'}: {zoneAchievement.name}
                          </small>
                        )}
                        {zoneRewardCopy && <small className="zone-reward-preview">{zoneRewardCopy}</small>}
                      </div>
                    )}
                    {zoneCanOpen && (
                      <button
                        type="button"
                        className="secondary-action"
                        onClick={() => openLadderZone(zone.id)}
                        disabled={!zoneUnlocked}
                      >
                        <Play size={18} />
                        {zoneCtaLabel}
                      </button>
                    )}
                    {!zoneUnlocked && (
                      <small className="zone-lock-copy">
                        {zone.id === KNIGHT_WOODS_ZONE_ID
                          ? 'Defeat Back Rank Guard to unlock.'
                          : zone.id === BISHOP_TOWER_ZONE_ID
                            ? 'Defeat The Smothered King to unlock.'
                            : zone.id === ROOK_FORTRESS_ZONE_ID
                                ? 'Defeat The Diagonal Keeper to unlock.'
                                : zone.id === QUEENS_COURT_ZONE_ID
                                  ? 'Defeat The Fortress King to unlock.'
                                  : zone.id === KINGS_GATE_ZONE_ID
                                    ? "Defeat The Queen's Trial to unlock."
                                    : zone.id === GRANDMASTER_KEEP_ZONE_ID
                                      ? 'Defeat The Running King to unlock.'
                                      : 'Coming soon'}
                      </small>
                    )}
                  </div>
                </article>
              );
            })}
          </section>

          <section className="coming-next-section" aria-label="Coming Next campaign worlds">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Coming Next</p>
                <h2>Future worlds.</h2>
              </div>
            </div>
            <div className="coming-next-grid">
              {COMING_NEXT_WORLDS.map((world) => (
                <article className="coming-next-card" key={world.name} aria-disabled="true">
                  <span className="zone-status">Teaser</span>
                  <div>
                    <h3>{world.name}</h3>
                    <strong>{world.label}</strong>
                    <p>{world.preview}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <div className="actions world-actions">
            <button type="button" className="primary-action" onClick={() => openLadderZone(currentCampaignZone?.id || PAWN_VILLAGE_ZONE_ID)}>
              <Play size={18} />
              Continue Campaign
            </button>
            <button type="button" className="secondary-action" onClick={() => startPuzzle(0, 'ladder')}>
              <ListChecks size={18} />
              Open Classic Ladder List
            </button>
            <button type="button" className="secondary-action" onClick={() => setScreen('home')}>
              <Home size={18} />
              Back Home
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (screen === 'rushIntro') {
    return (
      <main className="app-shell home-shell">
        <section className="home-hero rush-intro" aria-label="Rush Mode start">
          <div className="brand-row">
            <div>
              <p className="eyebrow">Rush Mode</p>
              <h1>Choose your sprint.</h1>
            </div>
            <div className="streak-pill">
              <Trophy size={17} />
              <span>{selectedRushModeConfig.shortLabel} best {selectedRushModeBestScore}</span>
            </div>
          </div>

          <div className="rush-mode-list" aria-label="Rush mode choices">
            {RUSH_MODE_OPTIONS.map((rushMode) => (
              <button
                type="button"
                className={`rush-mode-card ${selectedRushMode === rushMode.key ? 'active' : ''}`}
                key={rushMode.key}
                onClick={() => setSelectedRushMode(rushMode.key)}
              >
                <span>
                  <strong>{rushMode.label}</strong>
                  <small>{rushMode.description}</small>
                </span>
                <span className="rush-mode-meta">
                  <strong>{rushMode.durationSeconds ? formatTime(rushMode.durationSeconds) : 'No clock'}</strong>
                  <small>
                    {rushMode.key === RUSH_MODE_KEYS.endless ? 'One wrong ends' : `${rushMode.lives} lives`} | {rushMode.mateInLabel}
                  </small>
                  <small>Best {getBestRushScoreForMode(stats, rushMode.key)}</small>
                  {rushMode.key === RUSH_MODE_KEYS.endless && (
                    <small>Best depth {stats.bestEndlessDepth || 0}</small>
                  )}
                </span>
              </button>
            ))}
          </div>

          <div className="rush-rules">
            <div><strong>{selectedRushModeConfig.durationSeconds ? formatTime(selectedRushModeConfig.durationSeconds) : 'Survive'}</strong><span>{selectedRushModeConfig.durationSeconds ? 'Timed run' : 'No fixed countdown'}</span></div>
            <div>
              <strong>{selectedRushModeConfig.key === RUSH_MODE_KEYS.endless ? '1' : selectedRushModeConfig.lives}</strong>
              <span>{selectedRushModeConfig.key === RUSH_MODE_KEYS.endless ? 'Wrong move ends' : 'Lives'}</span>
            </div>
            <div><strong>Pool</strong><span>Candidate and approved puzzles only</span></div>
            <div><strong>Combo</strong><span>Perfect solves build multipliers</span></div>
            <div><strong>Depth</strong><span>{selectedRushModeConfig.mateInLabel}</span></div>
          </div>
          {!hasProductionRushPuzzles && (
            <p className="empty-log">No production-track Rush puzzles are available.</p>
          )}

          <div className="actions">
            <button type="button" className="primary-action" onClick={startRush} disabled={!hasProductionRushPuzzles}>
              <Zap size={18} />
              Start {selectedRushModeConfig.shortLabel}
            </button>
            <button type="button" className="secondary-action" onClick={() => setScreen('home')}>
              <Home size={18} />
              Back Home
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={`app-shell ${isRush && rushIsTimed && rushTimeLeft <= 30 ? 'low-time' : ''}`}>
      <section className="topbar" aria-label="QuickMate controls">
        <div>
          <button type="button" className="text-button" onClick={() => setScreen('home')}>
            QuickMate
          </button>
          <h1>
            {mode === 'daily' ? 'Daily Warmup' : ''}
            {mode === 'ladder' ? 'Puzzle Ladder' : ''}
            {mode === 'rush' ? activeRushModeConfig.label : ''}
            {mode === 'dailyRush' ? 'Daily Rush' : ''}
            {mode === 'ladderNode' ? activeLadderZone?.name || 'Ladder World' : ''}
          </h1>
        </div>
        <div className="topbar-actions">
          {!isChallengeRun && (
            <button type="button" className="icon-button" onClick={() => goToOffset(-1)} aria-label="Previous puzzle">
              <ChevronLeft size={20} />
            </button>
          )}
          {!isChallengeRun && (
            <button type="button" className="icon-button" onClick={() => resetPuzzle()} aria-label="Reset puzzle">
              <RotateCcw size={18} />
            </button>
          )}
          {!isChallengeRun && (
            <button type="button" className="icon-button" onClick={() => goToOffset(1)} aria-label="Next puzzle">
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </section>

      <section className="workspace">
        <aside className="sidebar" aria-label="Puzzle list">
          <div className="panel-header">
            <h2>
              {mode === 'daily' ? 'Daily Warmup' : ''}
              {isDailyRush ? 'Daily Rush' : ''}
              {mode === 'rush' ? 'Rush Queue' : ''}
              {isLadderNode ? activeLadderNode?.title || activeLadderZone?.name || 'Ladder World' : ''}
              {!isChallengeRun && mode !== 'daily' ? 'Puzzles' : ''}
            </h2>
            <span>
              {mode === 'daily' ? todayKey : ''}
              {isDailyRush ? `${Math.min(rushQueueCursor + 1, DAILY_RUSH_PUZZLE_COUNT)}/${DAILY_RUSH_PUZZLE_COUNT}` : ''}
              {mode === 'rush' ? `${rushQueueCursor + 1}/${rushQueue.length}` : ''}
              {isLadderNode ? `${Math.min(ladderNodeCursor + 1, activeLadderNodeTotal)}/${activeLadderNodeTotal}` : ''}
              {!isChallengeRun && mode !== 'daily' ? puzzles.length : ''}
            </span>
          </div>
          <div className="puzzle-list">
            {isChallengeRun ? (
              renderPuzzleItem(puzzle, puzzleIndex)
            ) : mode === 'daily' ? (
              renderPuzzleItem(puzzles[dailyPuzzleIndex], dailyPuzzleIndex)
            ) : (
              renderLadderPuzzleList()
            )}
          </div>
        </aside>

        <section className="board-zone" aria-label="Chess board">
          <div className="board-frame">
            <Chessboard
              options={{
                id: 'quickmate-board',
                position: fen,
                boardOrientation,
                allowDragging: boardIsInteractive,
                allowDragOffBoard: false,
                canDragPiece,
                onPieceDrop,
                onSquareClick,
                boardStyle: {
                  borderRadius: '8px',
                  boxShadow: '0 20px 44px rgba(11, 18, 32, 0.2)',
                },
                squareStyles: selectedSquareStyles,
                darkSquareStyle: { backgroundColor: '#58745f' },
                lightSquareStyle: { backgroundColor: '#e7d8bd' },
              }}
            />
          </div>
        </section>

        <aside className="info-panel" aria-label="Puzzle status">
          <div className="panel-title">
            <div>
              <p className="eyebrow">{formatTheme(getPuzzleThemes(puzzle))} | Mate in {mateIn}</p>
              <h2>{puzzle.title}</h2>
              <span className="puzzle-id">ID {puzzle.id}</span>
            </div>
            <span className="badge">{puzzle.rating}</span>
          </div>

          {isRush ? (
            <>
              <div className="rush-combo-panel" aria-label="Rush combo and multiplier">
                <div>
                  <p className="eyebrow">{isEndlessRush ? 'Streak' : 'Combo'}</p>
                  <strong>{rushStats.currentCombo}</strong>
                  <span>{rushMultiplier.toFixed(2)}x multiplier</span>
                </div>
                <div>
                  <p className="eyebrow">{isEndlessRush ? 'Next Streak' : 'Next Boost'}</p>
                  <strong>{nextRushMultiplier.label}</strong>
                  <span>{nextRushMultiplier.detail}</span>
                </div>
              </div>
              <div className="stats-grid rush-grid">
                <div className="stat">
                  <Zap size={18} />
                  <span>{isDailyRush ? `#${getDailyRushNumber(dailyRushRunDate)}` : activeRushModeConfig.shortLabel}</span>
                  <small>Mode</small>
                </div>
                {rushIsTimed && (
                  <div className="stat rush-time-stat">
                    <Clock3 size={18} />
                    <span>{formatTime(rushTimeLeft)}</span>
                    <small>Remaining</small>
                  </div>
                )}
                <div className="stat">
                  <Trophy size={18} />
                  <span>{isDailyRush ? stats.dailyRushStreak || 0 : activeRushBestRecord}</span>
                  <small>{isDailyRush ? 'Daily streak' : isEndlessRush ? 'Best Depth' : 'Mode Best'}</small>
                </div>
                <div className="stat">
                  <BadgeCheck size={18} />
                  <span>{rushLives}/{activeRushModeConfig.lives}</span>
                  <small>{isEndlessRush ? 'Run' : 'Lives'}</small>
                </div>
                <div className="stat">
                  <Sparkles size={18} />
                  <span>{rushStats.totalScore}</span>
                  <small>Score</small>
                </div>
                <div className="stat">
                  <BadgeCheck size={18} />
                  <span>{isDailyRush ? `${rushStats.solved}/${DAILY_RUSH_PUZZLE_COUNT}` : rushStats.solved}</span>
                  <small>{isEndlessRush ? 'Depth' : 'Solved'}</small>
                </div>
                <div className="stat">
                  <XCircle size={18} />
                  <span>{rushStats.misses}</span>
                  <small>Misses</small>
                </div>
                <div className="stat">
                  <XCircle size={18} />
                  <span>{rushStats.mistakes}</span>
                  <small>Mistakes</small>
                </div>
                <div className="stat">
                  <Target size={18} />
                  <span>{rushPuzzleMistakes}/{activeRushPuzzleAttemptLimit}</span>
                  <small>Attempts</small>
                </div>
                <div className="stat">
                  <SkipForward size={18} />
                  <span>{rushStats.skips}</span>
                  <small>Skips</small>
                </div>
              </div>
            </>
          ) : isLadderNode ? (
            <div className="stats-grid ladder-node-grid">
              <div className="stat">
                <ListChecks size={18} />
                <span>{activeLadderNode?.type === 'boss' ? 'Boss' : 'Node'}</span>
                <small>{activeLadderZone?.name || 'Ladder World'}</small>
              </div>
              <div className="stat">
                <BadgeCheck size={18} />
                <span>{ladderNodeStats.solved}/{activeLadderNode?.clearRequirement || 0}</span>
                <small>Needed</small>
              </div>
              {activeLadderNode?.lives && (
                <div className="stat">
                  <Trophy size={18} />
                  <span>{ladderNodeLives}/{activeLadderNode.lives}</span>
                  <small>Lives</small>
                </div>
              )}
              <div className="stat">
                <Target size={18} />
                <span>{ladderNodePuzzleMistakes}/{RUSH_MAX_PUZZLE_ATTEMPTS}</span>
                <small>Attempts</small>
              </div>
              <div className="stat">
                <XCircle size={18} />
                <span>{ladderNodeStats.misses}</span>
                <small>Misses</small>
              </div>
              <div className="stat">
                <Sparkles size={18} />
                <span>{stats.ladderXp || 0}</span>
                <small>Ladder XP</small>
              </div>
            </div>
          ) : (
            <div className="stats-grid">
              <div className="stat">
                <Clock3 size={18} />
                <span>{formatTime(seconds)}</span>
                <small>Timer</small>
              </div>
              <div className="stat">
                <XCircle size={18} />
                <span>{mistakes}</span>
                <small>Mistakes</small>
              </div>
              <div className="stat">
                <Eye size={18} />
                <span>{hints}</span>
                <small>Hints</small>
              </div>
            </div>
          )}

          <div className="progress-block" aria-label="Solution progress">
            <div className="progress-copy">
              <span>Line progress</span>
              <strong>{progress}%</strong>
            </div>
            <div className="progress-track">
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>

          <p className={`feedback ${isComplete ? 'success' : ''}`}>{feedback}</p>

          {isRush && rushReveal && (
            <div className="correct-line-panel" aria-label="Correct line">
              <div className="panel-header">
                <h3>Correct line</h3>
                <span>{rushReveal.reason} | ID {puzzle.id}</span>
              </div>
              <ol className="solution-line">
                {puzzle.solution.map((move, index) => (
                  <li className={index === 0 ? 'first-move' : ''} key={`${move}-${index}`}>
                    <span>{index === 0 ? 'First move' : `Move ${index + 1}`}</span>
                    <strong>{move}</strong>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {isLadderNode && ladderNodeReveal && (
            <div className="correct-line-panel" aria-label="Correct line">
              <div className="panel-header">
                <h3>Correct line</h3>
                <span>{ladderNodeReveal.reason} | ID {puzzle.id}</span>
              </div>
              <ol className="solution-line">
                {puzzle.solution.map((move, index) => (
                  <li className={index === 0 ? 'first-move' : ''} key={`${move}-${index}`}>
                    <span>{index === 0 ? 'First move' : `Move ${index + 1}`}</span>
                    <strong>{move}</strong>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="actions">
            {isRush && rushReveal ? (
              <button type="button" className="primary-action" onClick={continueRushAfterReveal}>
                <ChevronRight size={18} />
                {rushReveal?.endRun || rushLives <= 0 || rushRunShouldFinishAfterReveal ? 'Finish Run' : 'Next Puzzle'}
              </button>
            ) : isLadderNode && ladderNodeReveal ? (
              <button type="button" className="primary-action" onClick={continueLadderNodeAfterReveal}>
                <ChevronRight size={18} />
                {ladderNodeRunShouldEnd(ladderNodeStats, ladderNodeLives, ladderNodeCursor + 1)
                  ? 'Finish Node'
                  : 'Next Puzzle'}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="primary-action"
                  onClick={showHint}
                  disabled={isComplete || isRush || (isLadderNode && activeLadderNode?.noHints)}
                >
                  <Lightbulb size={18} />
                  {isLadderNode && activeLadderNode?.noHints ? 'No Hints' : 'Hint'}
                </button>
                {isRush ? (
                  <button type="button" className="secondary-action" onClick={skipRushPuzzle}>
                    <SkipForward size={18} />
                    {isEndlessRush ? 'End Run' : 'Skip'}
                  </button>
                ) : isLadderNode ? (
                  <button type="button" className="secondary-action" onClick={skipLadderNodePuzzle}>
                    <SkipForward size={18} />
                    Skip
                  </button>
                ) : (
                  <button type="button" className="secondary-action" onClick={() => resetPuzzle()}>
                    <RotateCcw size={18} />
                    Retry
                  </button>
                )}
              </>
            )}
          </div>

          <div className="move-log">
            <div className="panel-header">
              <h3>Line</h3>
              <Target size={18} />
            </div>
            {moveLog.length === 0 ? (
              <p className="empty-log">No moves yet.</p>
            ) : (
              <ol>
                {moveLog.map((move, index) => (
                  <li key={`${move.san}-${index}`}>
                    <span>{move.side}</span>
                    <strong>{move.san}</strong>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="saved-stats">
            <Trophy size={18} />
            <span>
              {isDailyRush
                ? `${dailyRushPracticeRun ? 'Practice Replay' : 'Official attempt'} | ${dailyRushRunDate}`
                : isLadderNode
                  ? `${activeLadderZone?.name || 'Ladder World'} ${activeLadderZoneProgress?.completedCount || 0}/${activeLadderZoneProgress?.totalCount || 0} | ${stats.ladderXp || 0} XP`
                : isRush
                  ? `${activeRushModeConfig.label} best ${activeRushModeBestScore}`
                  : `Best score ${stats.bestScore}`}
            </span>
          </div>
        </aside>
      </section>

      {isComplete && result && (
        <section className="result-screen" role="dialog" aria-modal="true" aria-label="Puzzle result">
          {cinematicMoment ? (
            <CinematicMoment moment={cinematicMoment} onDismiss={dismissCinematicMoment} />
          ) : result.mode === 'ladderNode' ? (
            <div className="result-panel">
              <Trophy size={42} />
              <p className="eyebrow">
                {result.cleared
                  ? result.nodeType === 'boss' ? 'Boss Defeated' : 'Node Clear'
                  : 'Node Failed'}
              </p>
              <h2>{result.nodeTitle}</h2>
              <div className="result-score">
                <Sparkles size={20} />
                <strong>{result.solved}/{result.totalPuzzles}</strong>
                <span>solved</span>
              </div>
              <div className="rush-result-highlights" aria-label="Ladder node highlights">
                <div className={`highlight-card ${result.cleared ? 'rank' : ''}`}>
                  <span>Status</span>
                  <strong>{result.cleared ? 'Cleared' : 'Retry'}</strong>
                </div>
                <div className="highlight-card">
                  <span>Reward XP</span>
                  <strong>+{result.rewardXp}</strong>
                </div>
                <div className="highlight-card">
                  <span>{result.zoneName || 'Ladder World'}</span>
                  <strong>{result.progressCompleted}/{result.progressTotal}</strong>
                </div>
              </div>
              <div className="score-breakdown" aria-label="Ladder node result">
                <div><span>Puzzles solved</span><strong>{result.solved}/{result.totalPuzzles}</strong></div>
                <div><span>Misses</span><strong>{result.misses}</strong></div>
                <div><span>Mistakes</span><strong>{result.mistakes}</strong></div>
                {result.livesRemaining !== null && (
                  <div><span>Lives remaining</span><strong>{result.livesRemaining}</strong></div>
                )}
                <div><span>Reward XP</span><strong>+{result.rewardXp}</strong></div>
                <div><span>Progress</span><strong>{result.progressCompleted}/{result.progressTotal} nodes</strong></div>
              </div>
              {result.earnedBadge && (
                <section className="earned-chest-card" aria-label="Badge earned">
                  <p className="eyebrow">Badge Earned</p>
                  <h3>{result.earnedBadge}</h3>
                  <small>{result.zoneCompleteMessage || `${result.zoneName || 'Zone'} progress complete.`}</small>
                </section>
              )}
              {result.collectionRewardItem && (
                <section
                  className={`chest-open-result ${result.collectionSetJustCompleted ? 'set-complete' : ''}`}
                  aria-label="Collection piece unlocked"
                >
                  <div className="unlock-hero">
                    <div
                      className={`unlock-piece-emblem ${getRarityClassName(result.collectionRewardItem.rarity)}`}
                      aria-hidden="true"
                    >
                      {result.collectionRewardItem.pieceType.charAt(0)}
                    </div>
                    <div>
                      <p className="eyebrow">Collection Piece Unlocked</p>
                      <h3>{result.collectionRewardItem.displayName}</h3>
                      <div className="unlock-meta-row">
                        <span className={`rarity-pill ${getRarityClassName(result.collectionRewardItem.rarity)}`}>
                          {result.collectionRewardItem.rarity}
                        </span>
                        <span className="piece-type-pill">{result.collectionRewardItem.pieceType}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`set-progress-card ${result.collectionSetJustCompleted ? 'complete' : ''}`}>
                    <div>
                      <span>Set progress</span>
                      <strong>
                        {result.collectionSetProgress?.setName || result.collectionRewardItem.setName}:{' '}
                        {result.collectionSetProgress?.ownedCount ?? 0}/
                        {result.collectionSetProgress?.totalCount ?? 6}
                      </strong>
                    </div>
                    {result.collectionSetJustCompleted && (
                      <span className="set-complete-banner">Set Complete!</span>
                    )}
                  </div>
                  <div className="score-breakdown compact unlock-details" aria-label="Ladder collection reward details">
                    <div><span>Source</span><strong>{result.nodeTitle}</strong></div>
                    <div><span>Reward preview</span><strong>{result.collectionRewardItem.cosmeticReward}</strong></div>
                  </div>
                </section>
              )}
              {result.earnedChest && !chestOpenResult && (
                <section className="earned-chest-card" aria-label="Chest earned">
                  <p className="eyebrow">Chest Earned</p>
                  <h3>{result.earnedChest.name}</h3>
                  <span>{result.earnedChest.tier} tier</span>
                  {result.earnedChest.bonusReason && <small>{result.earnedChest.bonusReason}</small>}
                  <button
                    type="button"
                    className="primary-action"
                    onClick={openEarnedChest}
                    disabled={result.earnedChest.opened}
                  >
                    <Sparkles size={18} />
                    {result.earnedChest.opened ? 'Chest Opened' : 'Open Chest'}
                  </button>
                </section>
              )}
              {chestOpenResult && (
                <section
                  className={`chest-open-result ${chestOpenResult.setJustCompleted ? 'set-complete' : ''}`}
                  aria-label="Chest opened"
                >
                  {chestOpenResult.unlockedItem ? (
                    <>
                      <div className="unlock-hero">
                        <div
                          className={`unlock-piece-emblem ${getRarityClassName(chestOpenResult.unlockedItem.rarity)}`}
                          aria-hidden="true"
                        >
                          {chestOpenResult.unlockedItem.pieceType.charAt(0)}
                        </div>
                        <div>
                          <p className="eyebrow">New Piece Unlocked</p>
                          <h3>{chestOpenResult.unlockedItem.displayName}</h3>
                          <div className="unlock-meta-row">
                            <span className={`rarity-pill ${getRarityClassName(chestOpenResult.unlockedItem.rarity)}`}>
                              {chestOpenResult.unlockedItem.rarity}
                            </span>
                            <span className="piece-type-pill">{chestOpenResult.unlockedItem.pieceType}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`set-progress-card ${chestOpenResult.setJustCompleted ? 'complete' : ''}`}>
                        <div>
                          <span>Set progress</span>
                          <strong>
                            {chestOpenResult.setProgress?.setName || chestOpenResult.unlockedItem.setName}:{' '}
                            {chestOpenResult.setProgress?.ownedCount ?? 0}/
                            {chestOpenResult.setProgress?.totalCount ?? 6}
                          </strong>
                        </div>
                        {chestOpenResult.setJustCompleted && (
                          <span className="set-complete-banner">Set Complete!</span>
                        )}
                      </div>
                      <div className="score-breakdown compact unlock-details" aria-label="Collection unlock details">
                        <div><span>Chest</span><strong>{chestOpenResult.chest.name}</strong></div>
                        <div><span>Reward preview</span><strong>{chestOpenResult.unlockedItem.cosmeticReward}</strong></div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="eyebrow">Chest Opened</p>
                      <h3>{chestOpenResult.completeMessage}</h3>
                      <p className="rank-chase">No duplicate pieces are awarded in Collection Rewards v1.</p>
                    </>
                  )}
                  <div className="actions">
                    <button type="button" className="primary-action" onClick={viewCollectionFromChest}>
                      <Trophy size={18} />
                      View Collection
                    </button>
                    <button type="button" className="secondary-action" onClick={returnToRushFromChest}>
                      <ListChecks size={18} />
                      Back to {result.zoneName || 'Ladder World'}
                    </button>
                  </div>
                </section>
              )}
              {result.zoneCompleteMessage && (
                <p className="rank-chase">{result.zoneCompleteMessage}.</p>
              )}
              {result.campaignCompleteMessage && (
                <p className="campaign-complete-banner">{result.campaignCompleteMessage}</p>
              )}
              {result.comingSoon && (
                <p className="rank-chase">Coming soon: {result.comingSoon}</p>
              )}
              {result.alreadyCompleted && result.cleared && (
                <p className="rank-chase">Rewards already claimed for this node.</p>
              )}
              <div className="actions">
                {result.cleared && result.nextNodeId && (
                  <button type="button" className="primary-action" onClick={() => startLadderNode(result.nextNodeId)}>
                    <ChevronRight size={18} />
                    Next Node
                  </button>
                )}
                {result.cleared && result.nextZoneId && (
                  <button type="button" className="primary-action" onClick={() => openLadderZone(result.nextZoneId)}>
                    <ChevronRight size={18} />
                    Open {result.nextZoneName}
                  </button>
                )}
                {!result.cleared && (
                  <button type="button" className="primary-action" onClick={() => startLadderNode(result.nodeId)}>
                    <RotateCcw size={18} />
                    Retry Node
                  </button>
                )}
                <button
                  type="button"
                  className={result.cleared && (result.nextNodeId || result.nextZoneId) ? 'secondary-action' : 'primary-action'}
                  onClick={() => openLadderZone(result.zoneId || PAWN_VILLAGE_ZONE_ID)}
                >
                  <ListChecks size={18} />
                  {result.zoneName || 'Ladder World'}
                </button>
                <button type="button" className="secondary-action" onClick={goHome}>
                  <Home size={18} />
                  Back Home
                </button>
              </div>
            </div>
          ) : result.mode === 'rush' || result.mode === 'dailyRush' ? (
            <div className="result-panel">
              <Zap size={42} />
              <p className="eyebrow">
                {result.mode === 'dailyRush'
                  ? result.dailyRushLabel
                  : result.isEndlessRush ? 'Endless run complete' : 'Rush complete'}
              </p>
              <h2>
                {result.mode === 'dailyRush'
                  ? `Daily Rush #${result.dailyRushNumber}`
                  : result.rushModeLabel || 'Rush Mode'}
              </h2>
              {result.mode === 'dailyRush' && (
                <div className="daily-result-strip" aria-label="Daily Rush summary">
                  <span>{result.dailyRushDate}</span>
                  <span>{result.solved}/{result.totalPuzzles} solved</span>
                  <span>{getDailyRushOutcomeRow(result.outcomes, result.totalPuzzles)}</span>
                </div>
              )}
              {result.isEndlessRush && (
                <div className="endless-result-strip" aria-label="Endless Survival summary">
                  <span>Depth {result.endlessDepth}</span>
                  <span>Best {result.bestEndlessDepth}</span>
                  <span>{Math.round((result.endlessAccuracy || 0) * 100)}% accuracy</span>
                </div>
              )}
              <div className="result-score">
                <Sparkles size={20} />
                <strong>{result.totalScore}</strong>
                <span>score</span>
              </div>
              <div className="rush-result-highlights" aria-label="Rush highlights">
                <div className="highlight-card rank">
                  <span>{result.isEndlessRush ? 'Depth' : 'Rank'}</span>
                  <strong>{result.isEndlessRush ? result.endlessDepth : result.rank}</strong>
                </div>
                <div className={`highlight-card ${result.isNewBest ? 'new-best' : ''}`}>
                  <span>
                    {result.mode === 'dailyRush'
                      ? result.dailyRushLabel
                      : result.isEndlessRush
                        ? result.isNewBestEndlessDepth ? 'New Depth Record' : 'Best Depth'
                      : result.isNewBest ? 'New Best' : 'Mode Best'}
                  </span>
                  <strong>
                    {result.mode === 'dailyRush'
                      ? `${result.solved}/${result.totalPuzzles}`
                      : result.isEndlessRush
                        ? result.bestEndlessDepth
                        : result.bestModeScore}
                  </strong>
                </div>
                <div className={`highlight-card ${result.isNewBestCombo ? 'new-best' : ''}`}>
                  <span>{result.isEndlessRush ? 'Best Streak' : result.isNewBestCombo ? 'New Best Combo' : 'Best Combo'}</span>
                  <strong>{result.isEndlessRush ? result.bestEndlessStreak : result.bestCombo}</strong>
                </div>
              </div>
              <div className="rank-progress-card" aria-label="Rush rank progress">
                <div className="progress-copy">
                  <span>Current rank</span>
                  <strong>{result.rankProgress.current.rank}</strong>
                </div>
                <div className="progress-track">
                  <span style={{ width: `${result.rankProgress.progressPercent}%` }} />
                </div>
                {result.rankProgress.next ? (
                  <>
                    <div className="rank-next-row">
                      <span>Next rank</span>
                      <strong>{result.rankProgress.next.rank}</strong>
                    </div>
                    <div className="rank-next-row">
                      <span>Points needed</span>
                      <strong>{result.rankProgress.pointsNeeded}</strong>
                    </div>
                    <p className="rank-chase">
                      You were {result.rankProgress.pointsNeeded} points from {result.rankProgress.next.rank}.
                    </p>
                  </>
                ) : (
                  <p className="rank-chase">Top Rush rank reached.</p>
                )}
              </div>
              <div className="score-breakdown" aria-label="Rush result">
                <div><span>Mode</span><strong>{result.rushModeLabel || 'Rush Mode'}</strong></div>
                {result.mode === 'dailyRush' && (
                  <>
                    <div><span>Daily Rush date</span><strong>{result.dailyRushDate}</strong></div>
                    <div><span>Daily number</span><strong>#{result.dailyRushNumber}</strong></div>
                    <div><span>Result type</span><strong>{result.dailyRushLabel}</strong></div>
                    <div><span>Daily streak</span><strong>{result.dailyRushStreak}</strong></div>
                  </>
                )}
                <div><span>Score</span><strong>{result.totalScore}</strong></div>
                <div><span>{result.mode === 'dailyRush' ? 'Rank' : 'Rush rank'}</span><strong>{result.rank}</strong></div>
                <div><span>Next rank</span><strong>{result.rankProgress.next?.rank || 'Max rank'}</strong></div>
                <div><span>Needed for next</span><strong>{result.rankProgress.next ? result.rankProgress.pointsNeeded : 0}</strong></div>
                {result.isEndlessRush && (
                  <>
                    <div><span>Best depth</span><strong>{result.bestEndlessDepth}</strong></div>
                    <div><span>New depth record</span><strong>{result.isNewBestEndlessDepth ? 'Yes' : 'No'}</strong></div>
                    <div><span>Accuracy</span><strong>{Math.round((result.endlessAccuracy || 0) * 100)}%</strong></div>
                    <div><span>Best Endless streak</span><strong>{result.bestEndlessStreak}</strong></div>
                  </>
                )}
                <div><span>Lives remaining</span><strong>{result.livesRemaining}</strong></div>
                <div>
                  <span>{result.isEndlessRush ? 'Depth reached' : 'Puzzles solved'}</span>
                  <strong>{result.mode === 'dailyRush' ? `${result.solved}/${result.totalPuzzles}` : result.solved}</strong>
                </div>
                <div><span>Perfect solves</span><strong>{result.perfectSolves}</strong></div>
                <div><span>Misses</span><strong>{result.misses}</strong></div>
                <div><span>Mistakes</span><strong>{result.mistakes}</strong></div>
                <div><span>Skips</span><strong>{result.skips}</strong></div>
                <div><span>{result.isEndlessRush ? 'Run streak' : 'Best combo'}</span><strong>{result.bestCombo}</strong></div>
                {result.mode === 'rush' && (
                  <div><span>{result.isEndlessRush ? 'Best Endless score' : 'Mode best score'}</span><strong>{result.bestModeScore}</strong></div>
                )}
                <div><span>Average solve time</span><strong>{formatTime(result.averageSolveTime)}</strong></div>
              </div>
              {getRushBadges(result).length > 0 && (
                <div className="badge-row" aria-label="Rush badges">
                  {getRushBadges(result).map((badge) => (
                    <span className="achievement-badge" key={badge}>{badge}</span>
                  ))}
                </div>
              )}
              {(result.newAchievements || []).length > 0 && (
                <section className="achievement-unlock-card" aria-label="Achievements unlocked">
                  <p className="eyebrow">Achievement Unlocked</p>
                  {(result.newAchievements || []).map((achievement) => (
                    <div className="achievement-unlock-row" key={achievement.id}>
                      <BadgeCheck size={18} />
                      <div>
                        <strong>{achievement.name}</strong>
                        <span>{achievement.description}</span>
                      </div>
                    </div>
                  ))}
                </section>
              )}
              {getResultEarnedChests(result).length > 0 && !chestOpenResult && (
                <section className="earned-chest-card reward-stack" aria-label="Chests earned">
                  <p className="eyebrow">Chest Earned</p>
                  {getResultEarnedChests(result).map((earnedChest) => (
                    <div className="earned-chest-row" key={earnedChest.chestId}>
                      <div>
                        <h3>{earnedChest.name}</h3>
                        <span className={`rarity-pill compact ${getRarityClassName(earnedChest.tier)}`}>
                          {earnedChest.tier}
                        </span>
                        {earnedChest.bonusReason && <small>{earnedChest.bonusReason}</small>}
                      </div>
                      <button
                        type="button"
                        className="primary-action"
                        onClick={() => openEarnedChest(earnedChest.chestId)}
                        disabled={earnedChest.opened}
                      >
                        <Sparkles size={18} />
                        {earnedChest.opened ? 'Opened' : 'Open'}
                      </button>
                    </div>
                  ))}
                </section>
              )}
              {result.noChestReason && getResultEarnedChests(result).length === 0 && (
                <p className="rank-chase">{result.noChestReason}</p>
              )}
              {chestOpenResult && (
                <section
                  className={`chest-open-result ${chestOpenResult.setJustCompleted ? 'set-complete' : ''}`}
                  aria-label="Chest opened"
                >
                  {chestOpenResult.unlockedItem ? (
                    <>
                      <div className="unlock-hero">
                        <div
                          className={`unlock-piece-emblem ${getRarityClassName(chestOpenResult.unlockedItem.rarity)}`}
                          aria-hidden="true"
                        >
                          {chestOpenResult.unlockedItem.pieceType.charAt(0)}
                        </div>
                        <div>
                          <p className="eyebrow">New Piece Unlocked</p>
                          <h3>{chestOpenResult.unlockedItem.displayName}</h3>
                          <div className="unlock-meta-row">
                            <span className={`rarity-pill ${getRarityClassName(chestOpenResult.unlockedItem.rarity)}`}>
                              {chestOpenResult.unlockedItem.rarity}
                            </span>
                            <span className="piece-type-pill">{chestOpenResult.unlockedItem.pieceType}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`set-progress-card ${chestOpenResult.setJustCompleted ? 'complete' : ''}`}>
                        <div>
                          <span>Set progress</span>
                          <strong>
                            {chestOpenResult.setProgress?.setName || chestOpenResult.unlockedItem.setName}:{' '}
                            {chestOpenResult.setProgress?.ownedCount ?? 0}/
                            {chestOpenResult.setProgress?.totalCount ?? 6}
                          </strong>
                        </div>
                        {chestOpenResult.setJustCompleted && (
                          <span className="set-complete-banner">Set Complete!</span>
                        )}
                      </div>
                      <div className="score-breakdown compact unlock-details" aria-label="Collection unlock details">
                        <div><span>Chest</span><strong>{chestOpenResult.chest.name}</strong></div>
                        <div><span>Chest rarity</span><strong>{chestOpenResult.chest.tier}</strong></div>
                        <div><span>Reward preview</span><strong>{chestOpenResult.unlockedItem.cosmeticReward}</strong></div>
                      </div>
                      {(chestOpenResult.newAchievements || []).length > 0 && (
                        <div className="achievement-mini-list" aria-label="Achievements unlocked from chest">
                          {(chestOpenResult.newAchievements || []).map((achievement) => (
                            <span key={achievement.id}>
                              <BadgeCheck size={15} />
                              {achievement.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="eyebrow">Chest Opened</p>
                      <h3>{chestOpenResult.completeMessage}</h3>
                      <p className="rank-chase">No duplicate pieces are awarded in Collection Rewards v1.</p>
                    </>
                  )}
                  <div className="actions">
                    <button type="button" className="primary-action" onClick={viewCollectionFromChest}>
                      <Trophy size={18} />
                      View Collection
                    </button>
                    <button type="button" className="secondary-action" onClick={returnToRushFromChest}>
                      <Zap size={18} />
                      {result.mode === 'dailyRush' ? 'Back Home' : 'Back to Rush'}
                    </button>
                  </div>
                </section>
              )}
              <div className="review-missed" aria-label="Review missed Rush puzzles">
                <div className="panel-header">
                  <h3>Review Missed</h3>
                  <span>{(result.missedPuzzles || []).length}</span>
                </div>
                {(result.missedPuzzles || []).length === 0 ? (
                  <p className="empty-log">No missed or skipped puzzles.</p>
                ) : (
                  <div className="missed-list">
                    {(result.missedPuzzles || []).map((item, index) => {
                      const solutionLine = item.solution || [item.firstMove].filter(Boolean);
                      const feedbackKey = `${item.id}-${item.reason}-${index}`;
                      const feedbackCopyStatus = puzzleFeedbackCopyStatus[feedbackKey] || 'Copy Puzzle Feedback';

                      return (
                        <div className="missed-item" key={feedbackKey}>
                          <span className="missed-reason">{item.reason}</span>
                          <div className="missed-title-row">
                            <strong>{item.title}</strong>
                            <span className="puzzle-id">ID {item.id}</span>
                          </div>
                          <small>Mate in {item.mateIn} | {formatTheme(item.themes)}</small>
                          <small>Wrong moves: {item.wrongMoveCount ?? 0}/{result.maxPuzzleAttempts || RUSH_MAX_PUZZLE_ATTEMPTS}</small>
                          <small>Correct line: {solutionLine.join(' ')}</small>
                          <button
                            type="button"
                            className="feedback-copy-button"
                            onClick={() => copyPuzzleFeedback(item, feedbackKey)}
                          >
                            <Copy size={16} />
                            {feedbackCopyStatus}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              {result.mode === 'rush' && stats.rushHistory.length > 0 && (
                <div className="result-history" aria-label="Recent Rush runs">
                  <h3>Recent runs</h3>
                  {stats.rushHistory.map((run) => (
                    <div className="history-item compact" key={`${run.date}-${run.score}`}>
                      <span>{run.score}</span>
                      <span>{run.rushModeLabel || getRushModeLabel(run.rushMode)}</span>
                      <span>{run.bestCombo} combo</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="actions">
                <button
                  type="button"
                  className="primary-action"
                  onClick={result.mode === 'dailyRush' ? startDailyRush : startRush}
                >
                  <Zap size={18} />
                  {result.mode === 'dailyRush' ? 'Practice Replay' : `Play ${selectedRushModeConfig.shortLabel} Again`}
                </button>
                <button type="button" className="secondary-action" onClick={copyResult}>
                  <Copy size={18} />
                  {result.mode === 'dailyRush' && copyStatus === 'Copy Result' ? 'Copy Daily Result' : copyStatus}
                </button>
                <button type="button" className="secondary-action" onClick={goHome}>
                  <Home size={18} />
                  Back Home
                </button>
              </div>
            </div>
          ) : (
            <div className="result-panel">
              <BadgeCheck size={42} />
              <p className="eyebrow">Checkmate</p>
              <h2>{puzzle.title} solved</h2>
              <div className="result-score">
                <Sparkles size={20} />
                <strong>{result.score}</strong>
                <span>score</span>
              </div>
              <div className="result-meta">
                <span>{formatTime(result.seconds)}</span>
                <span>{result.mistakes} mistakes</span>
                <span>{result.hints} hints</span>
              </div>
              <div className="score-breakdown" aria-label="Score breakdown">
                <div><span>Base</span><strong>+{result.base}</strong></div>
                <div><span>No mistakes</span><strong>+{result.noMistakesBonus}</strong></div>
                <div><span>No hints</span><strong>+{result.noHintsBonus}</strong></div>
                <div><span>Fast solve</span><strong>+{result.fastSolveBonus}</strong></div>
                <div><span>Wrong moves</span><strong>-{result.wrongMovePenalty}</strong></div>
                <div><span>Hints used</span><strong>-{result.hintPenalty}</strong></div>
              </div>
              <div className="actions">
                <button type="button" className="secondary-action" onClick={copyResult}>
                  <Copy size={18} />
                  {copyStatus}
                </button>
                <button type="button" className="secondary-action" onClick={() => resetPuzzle()}>
                  <RotateCcw size={18} />
                  Try Again
                </button>
                <button type="button" className="primary-action" onClick={() => goToOffset(1)}>
                  <ChevronRight size={18} />
                  Next Puzzle
                </button>
                <button type="button" className="secondary-action" onClick={goHome}>
                  <Home size={18} />
                  Back Home
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
