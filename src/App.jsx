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
import { PIECE_SETS } from './collections.js';
import { puzzles } from './puzzles.js';

const STORAGE_KEY = 'quickmate.stats.v1';
const SKIP_PENALTY = 100;
const RUSH_SKIP_TIME_PENALTY = 5;
const RUSH_WRONG_MOVE_TIME_PENALTY = 3;
const RUSH_MAX_PUZZLE_ATTEMPTS = 2;
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
};

const RUSH_MODE_OPTIONS = [
  RUSH_MODES[RUSH_MODE_KEYS.blitz],
  RUSH_MODES[RUSH_MODE_KEYS.classic],
  RUSH_MODES[RUSH_MODE_KEYS.survival],
];

const LADDER_WORLD_ZONES = [
  {
    id: 'pawn-village',
    name: 'Pawn Village',
    focus: 'First tactics, direct mates, and simple forcing moves.',
    mateInRange: 'Mate in 1',
    difficultyRange: 'Starter to Easy',
    motifs: ['back-rank basics', 'protected mates', 'promotion finish'],
    bossName: 'The Pawn Captain',
    rewardPreview: 'Classic Pawn, Bronze Pawn, starter coins',
    unlocked: true,
    color: '#3f7a4f',
  },
  {
    id: 'knight-woods',
    name: 'Knight Woods',
    focus: 'Knight patterns, forks, smothered shapes, and unusual geometry.',
    mateInRange: 'Mate in 1-2',
    difficultyRange: 'Easy to Medium',
    motifs: ['knight-mate', 'smothered-mate', 'corner nets'],
    bossName: 'The Forest Knight',
    rewardPreview: 'Shadow Knight fragment, Knight Woods badge',
    unlocked: false,
    color: '#4c6f9f',
  },
  {
    id: 'bishop-tower',
    name: 'Bishop Tower',
    focus: 'Diagonal control, long-range coverage, and bishop mating nets.',
    mateInRange: 'Mate in 1-2',
    difficultyRange: 'Easy to Medium',
    motifs: ['bishop-diagonal', 'discovered-check', 'pinned defender'],
    bossName: 'The Tower Bishop',
    rewardPreview: 'Royal Bishop fragment, tower badge',
    unlocked: false,
    color: '#7a5c9f',
  },
  {
    id: 'rook-fortress',
    name: 'Rook Fortress',
    focus: 'Files, ranks, back-rank pressure, clearance, and rook lifts.',
    mateInRange: 'Mate in 2-3',
    difficultyRange: 'Medium to Advanced',
    motifs: ['rook-file', 'deflection', 'overloaded defender'],
    bossName: 'The Fortress Warden',
    rewardPreview: 'Bronze Rook, fortress frame, coin chest',
    unlocked: false,
    color: '#8a6a2f',
  },
  {
    id: 'queens-court',
    name: "Queen's Court",
    focus: 'Queen coordination, sacrifices, forcing checks, and attack conversion.',
    mateInRange: 'Mate in 2-3',
    difficultyRange: 'Medium to Advanced',
    motifs: ['queen-sacrifice', 'decoy', 'king-hunt'],
    bossName: 'The Court Queen',
    rewardPreview: 'Royal Queen fragment, court banner',
    unlocked: false,
    color: '#9a4f72',
  },
  {
    id: 'kings-gate',
    name: "King's Gate",
    focus: 'Defensive resources, exact forcing lines, and boss-gate pressure.',
    mateInRange: 'Mate in 2-4',
    difficultyRange: 'Advanced to Expert',
    motifs: ['double-check', 'quiet move', 'no-escape nets'],
    bossName: 'The Gatekeeper King',
    rewardPreview: 'Shadow King, gate key cosmetic',
    unlocked: false,
    color: '#7b4a32',
  },
  {
    id: 'grandmaster-keep',
    name: 'Grandmaster Keep',
    focus: 'Deep calculation, mixed motifs, and long-term mastery.',
    mateInRange: 'Mate in 3-4, later 5+',
    difficultyRange: 'Expert to Master',
    motifs: ['multi-theme lines', 'sacrifice', 'promotion'],
    bossName: 'The Grandmaster',
    rewardPreview: 'Grandmaster Set pieces, title, animated frame',
    unlocked: false,
    color: '#2e4968',
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
  bestRushCombo: 0,
  rushGamesPlayed: 0,
  rushHistory: [],
  bestTimeByPuzzleId: {},
  puzzleCompletions: {},
  completedDailyPuzzleDate: '',
  currentDailyStreak: 0,
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

const RUSH_RANKS = [
  { rank: 'Warmup', minScore: 0 },
  { rank: 'Tactician', minScore: 1000 },
  { rank: 'Attacker', minScore: 2500 },
  { rank: 'Closer', minScore: 5000 },
  { rank: 'Checkmate Machine', minScore: 7500 },
  { rank: 'QuickMate Master', minScore: 10000 },
];

const RUSH_MULTIPLIER_THRESHOLDS = [
  { combo: 2, multiplier: 1.25 },
  { combo: 3, multiplier: 1.5 },
  { combo: 5, multiplier: 2 },
  { combo: 8, multiplier: 2.5 },
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

function shuffle(values) {
  return [...values].sort(() => Math.random() - 0.5);
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

function getRushEligiblePuzzleIndexes(solvedCount, rushModeKey = RUSH_MODE_KEYS.classic) {
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
  );
}

function loadStats() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : {};
    const legacyBestRushScore = parsed.bestRushScore || 0;
    const bestBlitzRushScore = parsed.bestBlitzRushScore || 0;
    const bestClassicRushScore = parsed.bestClassicRushScore ?? legacyBestRushScore;
    const bestSurvivalRushScore = parsed.bestSurvivalRushScore || 0;
    return {
      ...DEFAULT_STATS,
      ...parsed,
      bestRushScore: Math.max(
        legacyBestRushScore,
        bestBlitzRushScore,
        bestClassicRushScore,
        bestSurvivalRushScore,
      ),
      bestBlitzRushScore,
      bestClassicRushScore,
      bestSurvivalRushScore,
      bestRushCombo: parsed.bestRushCombo
        || Math.max(0, ...(parsed.rushHistory || []).map((run) => run.bestCombo || 0)),
      rushGamesPlayed: parsed.rushGamesPlayed || 0,
      rushHistory: parsed.rushHistory || [],
      bestTimeByPuzzleId: parsed.bestTimeByPuzzleId || {},
      puzzleCompletions: parsed.puzzleCompletions || {},
    };
  } catch {
    return DEFAULT_STATS;
  }
}

function saveStats(stats) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

function getPuzzleBehavior(currentMode) {
  return currentMode === 'rush'
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

const productionRushPuzzleCount = getPuzzleIndexesForMode('rush', { productionTrackOnly: true }).length;
const hasProductionRushPuzzles = productionRushPuzzleCount > 0;

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
  const [rushPuzzleMistakes, setRushPuzzleMistakes] = useState(0);
  const [rushReveal, setRushReveal] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState(null);

  const puzzle = puzzles[puzzleIndex];
  const game = useMemo(() => new Chess(fen), [fen]);
  const expectedMove = puzzle.solution[solutionIndex];
  const progress = Math.round((solutionIndex / puzzle.solution.length) * 100);
  const boardOrientation = puzzle.sideToMove === 'black' ? 'black' : 'white';
  const mateIn = getMateIn(puzzle);
  const dailyDone = stats.completedDailyPuzzleDate === todayKey;
  const isRush = mode === 'rush';
  const puzzleBehavior = getPuzzleBehavior(mode);
  const selectedRushModeConfig = getRushModeConfig(selectedRushMode);
  const activeRushModeConfig = getRushModeConfig(activeRushMode);
  const rushIsTimed = rushModeIsTimed(activeRushMode);
  const selectedRushModeBestScore = getBestRushScoreForMode(stats, selectedRushMode);
  const activeRushModeBestScore = getBestRushScoreForMode(stats, activeRushMode);
  const boardIsInteractive = screen === 'game'
    && !isComplete
    && Boolean(expectedMove)
    && (!isRush || ((!rushIsTimed || rushTimeLeft > 0) && rushLives > 0 && !rushReveal));
  const rushMultiplier = getRushMultiplier(rushStats.currentCombo);
  const nextRushMultiplier = getNextRushMultiplierInfo(rushStats.currentCombo);
  const bestRushCombo = stats.bestRushCombo || 0;
  const bestOverallRushScore = getBestOverallRushScore(stats);
  const bestRushRank = getRushRank(bestOverallRushScore);
  const recentRushRuns = (stats.rushHistory || []).slice(0, 3);
  const ladderSolvedCount = Object.values(stats.puzzleCompletions).filter((completion) => completion?.solved).length;
  const selectedSquareStyles = selectedSquare
    ? {
        [selectedSquare]: {
          boxShadow: 'inset 0 0 0 4px rgba(255, 226, 95, 0.95)',
          background: 'linear-gradient(135deg, rgba(255, 226, 95, 0.42), rgba(255, 255, 255, 0.08))',
        },
      }
    : {};
  const groupedPuzzles = useMemo(() => {
    return puzzles.reduce((groups, item, index) => {
      const statusKey = item.contentStatus || 'unspecified';
      const mateInKey = item.mateIn;

      if (!groups[statusKey]) {
        groups[statusKey] = {};
      }

      if (!groups[statusKey][mateInKey]) {
        groups[statusKey][mateInKey] = [];
      }

      groups[statusKey][mateInKey].push({ item, index });
      return groups;
    }, {});
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
    setFeedback(nextFeedback);
    setSelectedSquare(null);
    setRushPuzzleMistakes(0);
    setRushReveal(null);
  }

  function startPuzzle(index, nextMode = 'ladder') {
    resetPuzzle(index, nextMode);
    setScreen('game');
  }

  function startDaily() {
    startPuzzle(dailyPuzzleIndex, 'daily');
  }

  function openRushIntro() {
    setMode('rush');
    setScreen('rushIntro');
  }

  function openLadderWorld() {
    setMode('ladder');
    setScreen('ladderWorld');
  }

  function openCollection() {
    setScreen('collection');
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
    setRushPuzzleMistakes(0);
    setRushReveal(null);
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

  function endRush() {
    const averageSolveTime = rushStats.solved > 0
      ? Math.round(rushStats.totalSolveSeconds / rushStats.solved)
      : 0;
    const rushMode = activeRushModeConfig;
    const previousBestModeScore = activeRushModeBestScore;
    const previousBestRushCombo = stats.bestRushCombo || 0;
    const rank = getRushRank(rushStats.totalScore);
    const rankProgress = getRushRankProgress(rushStats.totalScore);
    const nextResult = {
      mode: 'rush',
      rushMode: rushMode.key,
      rushModeLabel: rushMode.label,
      livesRemaining: rushLives,
      solved: rushStats.solved,
      perfectSolves: rushStats.perfectSolves,
      mistakes: rushStats.mistakes,
      misses: rushStats.misses,
      skips: rushStats.skips,
      totalScore: rushStats.totalScore,
      averageSolveTime,
      bestCombo: rushStats.bestCombo,
      rank,
      rankProgress,
      isNewBest: rushStats.totalScore > previousBestModeScore,
      isNewBestCombo: rushStats.bestCombo > previousBestRushCombo,
      bestRushScore: Math.max(getBestOverallRushScore(stats), rushStats.totalScore),
      bestModeScore: Math.max(previousBestModeScore, rushStats.totalScore),
      bestRushCombo: Math.max(previousBestRushCombo, rushStats.bestCombo),
      missedPuzzles: rushMissedPuzzles,
    };
    const historyEntry = {
      date: new Date().toISOString(),
      rushMode: rushMode.key,
      rushModeLabel: rushMode.label,
      score: rushStats.totalScore,
      rank,
      livesRemaining: rushLives,
      solved: rushStats.solved,
      mistakes: rushStats.mistakes,
      misses: rushStats.misses,
      skips: rushStats.skips,
      bestCombo: rushStats.bestCombo,
    };

    setIsComplete(true);
    setResult(nextResult);
    setFeedback('Rush complete.');
    setStats((currentStats) => {
      const nextStats = {
        ...currentStats,
        [rushMode.bestScoreKey]: Math.max(currentStats[rushMode.bestScoreKey] || 0, rushStats.totalScore),
        bestRushScore: Math.max(getBestOverallRushScore(currentStats), rushStats.totalScore),
        bestRushCombo: Math.max(currentStats.bestRushCombo || 0, rushStats.bestCombo),
        rushGamesPlayed: (currentStats.rushGamesPlayed || 0) + 1,
        rushHistory: [historyEntry, ...(currentStats.rushHistory || [])].slice(0, 5),
      };

      saveStats(nextStats);
      return nextStats;
    });
  }

  function continueRushAfterReveal() {
    if (!isRush || isComplete) {
      return;
    }

    if (rushLives <= 0 || (rushIsTimed && rushTimeLeft <= 0)) {
      endRush();
      return;
    }

    advanceRushPuzzle(rushStats.solved, rushUsedPuzzleIds);
  }

  function skipRushPuzzle() {
    if (!isRush || isComplete || (rushIsTimed && rushTimeLeft <= 0) || rushLives <= 0 || rushReveal) {
      return;
    }

    const nextUsedPuzzleIds = [...rushUsedPuzzleIds, puzzle.id];
    const nextLives = Math.max(0, rushLives - 1);

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
    if (rushIsTimed) {
      setRushTimeLeft((value) => Math.max(0, value - RUSH_SKIP_TIME_PENALTY));
    }
    setSelectedSquare(null);
    setRushReveal({ reason: 'Skipped', wrongMoveCount: rushPuzzleMistakes });
    setFeedback(nextLives === 0
      ? 'Skipped. No lives left. Correct line shown.'
      : `Skipped. Correct line shown. -100 score${rushIsTimed ? `, -${RUSH_SKIP_TIME_PENALTY} seconds` : ''}.`);
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
    const scoreBreakdown = calculateScore({
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
    const nextCombo = isPerfectSolve ? rushStats.currentCombo + 1 : rushStats.currentCombo;
    const multiplier = getRushMultiplier(nextCombo);
    const awardedScore = Math.round(scoreBreakdown.score * multiplier);
    const timeBonus = rushIsTimed ? (isPerfectSolve ? 5 : 0) + (isFastSolve ? 3 : 0) : 0;
    const feedbackParts = [
      `+${awardedScore} points`,
      `${multiplier.toFixed(2)}x`,
      `combo ${nextCombo}`,
    ];

    if (timeBonus > 0) {
      feedbackParts.push(`+${timeBonus} seconds`);
    }

    updateStatsForSolve(nextResult);
    setRushStats((currentStats) => {
      return {
        ...currentStats,
        solved: currentStats.solved + 1,
        perfectSolves: currentStats.perfectSolves + (isPerfectSolve ? 1 : 0),
        currentCombo: nextCombo,
        bestCombo: Math.max(currentStats.bestCombo, nextCombo),
        totalScore: currentStats.totalScore + awardedScore,
        totalSolveSeconds: currentStats.totalSolveSeconds + seconds,
      };
    });
    if (timeBonus > 0) {
      setRushTimeLeft((value) => Math.min(activeRushModeConfig.durationSeconds, value + timeBonus));
    }

    const nextUsedPuzzleIds = [...rushUsedPuzzleIds, puzzle.id];
    setRushUsedPuzzleIds(nextUsedPuzzleIds);
    advanceRushPuzzle(rushStats.solved + 1, nextUsedPuzzleIds, feedbackParts.join(' | '));
  }

  function copyResult() {
    if (!result) {
      return;
    }

    const resultText = [
      result.mode === 'rush'
        ? `QuickMate ${result.rushModeLabel || 'Rush'}`
        : `QuickMate ${result.mode === 'daily' ? `Daily ${todayKey}` : puzzle.title}`,
      result.mode === 'rush'
        ? `${result.totalScore} points | ${result.solved} solved | ${result.misses} misses | ${result.skips} skips`
        : `${result.score} points in ${formatTime(result.seconds)}`,
      result.mode === 'rush'
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

      if (!isMissed) {
        if (rushIsTimed) {
          setRushTimeLeft((value) => Math.max(0, value - RUSH_WRONG_MOVE_TIME_PENALTY));
        }
        setFeedback(RUSH_FIRST_MISS_FEEDBACK);
        return;
      }

      const nextUsedPuzzleIds = [...rushUsedPuzzleIds, puzzle.id];

      setRushMissedPuzzles((items) => [
        ...items,
        getRushReviewItem(puzzle, 'Missed', { wrongMoveCount: nextPuzzleMistakes }),
      ]);
      setRushLives(nextLives);
      setRushUsedPuzzleIds(nextUsedPuzzleIds);
      setSelectedSquare(null);
      setRushReveal({ reason: 'Missed', wrongMoveCount: nextPuzzleMistakes });
      setFeedback(nextLives === 0
        ? 'Missed. No lives left. Correct line shown.'
        : 'Missed. Correct line shown. -1 life.');
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
    setScreen('home');
  }

  function renderPuzzleItem(item, index) {
    const completion = stats.puzzleCompletions[item.id];
    const status = getPuzzleStatus(completion);

    return (
      <button
        type="button"
        key={item.id}
        className={`puzzle-item ${index === puzzleIndex ? 'active' : ''} ${status}`}
        onClick={() => startPuzzle(index, isRush ? 'rush' : mode === 'daily' ? 'daily' : 'ladder')}
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

  if (screen === 'home') {
    return (
      <main className="app-shell home-shell">
        <section className="home-hero" aria-label="QuickMate menu">
          <div className="brand-row">
            <div>
              <p className="eyebrow">QuickMate</p>
              <h1>Mate puzzles, fast.</h1>
            </div>
            <div className="streak-pill">
              <Sparkles size={17} />
              <span>{stats.currentDailyStreak} day streak</span>
            </div>
          </div>

          <section className="rush-home" aria-label="Rush Mode">
            <button type="button" className="mode-card rush-hero-card featured" onClick={openRushIntro}>
              <Zap size={30} />
              <span>
                <strong>Rush Mode</strong>
                <small>Blitz, Classic, or Survival | best rank {bestRushRank}</small>
              </span>
              <Play size={24} />
            </button>

            <div className="rush-home-metrics" aria-label="Rush performance">
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

          <div className="mode-grid secondary-mode-grid">
            <button type="button" className="mode-card" onClick={startDaily}>
              <CalendarDays size={24} />
              <span>
                <strong>Daily QuickMate</strong>
                <small>{dailyDone ? `${stats.currentDailyStreak} day streak` : `Today: ${puzzles[dailyPuzzleIndex].title}`}</small>
              </span>
              <Play size={20} />
            </button>

            <button type="button" className="mode-card" onClick={openLadderWorld}>
              <ListChecks size={24} />
              <span>
                <strong>Ladder World</strong>
                <small>Pawn Village unlocked | {ladderSolvedCount}/{puzzles.length} solved</small>
              </span>
              <Play size={20} />
            </button>

            <button type="button" className="mode-card" onClick={openCollection}>
              <Trophy size={24} />
              <span>
                <strong>Collection</strong>
                <small>Piece sets, cosmetics, and status rewards</small>
              </span>
              <Play size={20} />
            </button>
          </div>

          <div className="home-stats" aria-label="Saved stats">
            <div>
              <strong>{stats.currentDailyStreak}</strong>
              <span>Daily streak</span>
            </div>
            <div>
              <strong>{ladderSolvedCount}/{puzzles.length}</strong>
              <span>Ladder progress</span>
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
                    <li>Rush uses production-track puzzles only.</li>
                    <li>First wrong legal move breaks combo, costs 3 seconds in timed modes, and gives one more try.</li>
                    <li>Second wrong legal move loses a life, marks the puzzle missed, reveals the correct line, and waits for Next Puzzle.</li>
                    <li>Skip loses a life, breaks combo, applies the skip penalty, reveals the correct line, and waits for Next Puzzle.</li>
                    <li>Perfect solves have no wrong moves and build combo multipliers.</li>
                    <li>Fast or perfect solves can add time in timed modes.</li>
                    <li>Survival starts easy and allows deeper mate sequences as you solve and as content expands.</li>
                  </ul>
                </section>
                <section className="help-section">
                  <h3>Daily and Ladder</h3>
                  <ul className="help-list">
                    <li>Daily and Ladder are training modes.</li>
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
              <span>{PIECE_SETS.length} sets</span>
            </div>
          </div>

          <section className="collection-intro" aria-label="Collection overview">
            <p>
              Collect pieces by playing Rush, clearing Ladder nodes, and defeating bosses.
              Collection rewards are cosmetic/status-based only.
            </p>
          </section>

          <section className="collection-grid" aria-label="Collectible piece sets">
            {PIECE_SETS.map((pieceSet) => {
              const ownedCount = pieceSet.pieces.filter((piece) => piece.owned).length;
              const isComplete = ownedCount === pieceSet.pieces.length;

              return (
                <article
                  className={`collection-set-card ${isComplete ? 'unlocked' : 'locked'}`}
                  key={pieceSet.setId}
                >
                  <div className="collection-set-header">
                    <div>
                      <p className="eyebrow">{pieceSet.rarity}</p>
                      <h2>{pieceSet.setName}</h2>
                    </div>
                    <span className="collection-progress">{ownedCount}/{pieceSet.pieces.length}</span>
                  </div>
                  <div className="collection-reward">
                    <span>Reward preview</span>
                    <strong>{pieceSet.cosmeticReward}</strong>
                  </div>
                  <div className="piece-slots" aria-label={`${pieceSet.setName} pieces`}>
                    {pieceSet.pieces.map((piece) => (
                      <div className={`piece-slot ${piece.owned ? 'owned' : 'locked'}`} key={piece.collectionItemId}>
                        <span>{piece.pieceType.charAt(0)}</span>
                        <strong>{piece.pieceType}</strong>
                        <small>{piece.owned ? 'Unlocked' : 'Locked'}</small>
                      </div>
                    ))}
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

  if (screen === 'ladderWorld') {
    return (
      <main className="app-shell home-shell">
        <section className="home-hero ladder-world" aria-label="Ladder World map preview">
          <div className="brand-row">
            <div>
              <p className="eyebrow">Ladder World</p>
              <h1>Clear the chess road.</h1>
            </div>
            <div className="streak-pill">
              <ListChecks size={17} />
              <span>{ladderSolvedCount}/{puzzles.length} solved</span>
            </div>
          </div>

          <section className="world-summary" aria-label="Ladder World summary">
            <div>
              <strong>Pawn Village</strong>
              <span>Unlocked starting zone</span>
            </div>
            <div>
              <strong>{LADDER_WORLD_ZONES.length - 1}</strong>
              <span>Coming soon zones</span>
            </div>
            <div>
              <strong>Cosmetic</strong>
              <span>Rewards planned only</span>
            </div>
          </section>

          <section className="world-map" aria-label="Ladder World zones">
            {LADDER_WORLD_ZONES.map((zone, index) => (
              <article
                className={`zone-node ${zone.unlocked ? 'unlocked' : 'locked'}`}
                key={zone.id}
                style={{ '--zone-color': zone.color }}
              >
                <div className="zone-marker" aria-hidden="true">
                  <span>{index + 1}</span>
                </div>
                <div className="zone-card">
                  <div className="zone-card-header">
                    <div>
                      <p className="eyebrow">{zone.mateInRange}</p>
                      <h2>{zone.name}</h2>
                    </div>
                    <span className="zone-status">{zone.unlocked ? 'Unlocked' : 'Locked'}</span>
                  </div>
                  <p>{zone.focus}</p>
                  <div className="zone-details">
                    <div>
                      <span>Difficulty</span>
                      <strong>{zone.difficultyRange}</strong>
                    </div>
                    <div>
                      <span>Boss</span>
                      <strong>{zone.bossName}</strong>
                    </div>
                    <div>
                      <span>Rewards</span>
                      <strong>{zone.rewardPreview}</strong>
                    </div>
                  </div>
                  <div className="zone-motifs" aria-label={`${zone.name} puzzle motifs`}>
                    {zone.motifs.map((motif) => (
                      <span key={motif}>{motif}</span>
                    ))}
                  </div>
                  {!zone.unlocked && <small className="zone-lock-copy">Coming soon</small>}
                </div>
              </article>
            ))}
          </section>

          <div className="actions world-actions">
            <button type="button" className="primary-action" onClick={() => startPuzzle(0, 'ladder')}>
              <Play size={18} />
              Start Pawn Village
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
                  <small>{rushMode.lives} lives | {rushMode.mateInLabel}</small>
                  <small>Best {getBestRushScoreForMode(stats, rushMode.key)}</small>
                </span>
              </button>
            ))}
          </div>

          <div className="rush-rules">
            <div><strong>{selectedRushModeConfig.durationSeconds ? formatTime(selectedRushModeConfig.durationSeconds) : 'Survive'}</strong><span>{selectedRushModeConfig.durationSeconds ? 'Timed run' : 'No fixed countdown'}</span></div>
            <div><strong>{selectedRushModeConfig.lives}</strong><span>Lives</span></div>
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
            {mode === 'daily' ? 'Daily QuickMate' : ''}
            {mode === 'ladder' ? 'Puzzle Ladder' : ''}
            {mode === 'rush' ? activeRushModeConfig.label : ''}
          </h1>
        </div>
        <div className="topbar-actions">
          {!isRush && (
            <button type="button" className="icon-button" onClick={() => goToOffset(-1)} aria-label="Previous puzzle">
              <ChevronLeft size={20} />
            </button>
          )}
          <button type="button" className="icon-button" onClick={() => resetPuzzle()} aria-label="Reset puzzle">
            <RotateCcw size={18} />
          </button>
          {!isRush && (
            <button type="button" className="icon-button" onClick={() => goToOffset(1)} aria-label="Next puzzle">
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </section>

      <section className="workspace">
        <aside className="sidebar" aria-label="Puzzle list">
          <div className="panel-header">
            <h2>{mode === 'daily' ? 'Daily' : isRush ? 'Rush Queue' : 'Puzzles'}</h2>
            <span>{mode === 'daily' ? todayKey : isRush ? `${rushQueueCursor + 1}/${rushQueue.length}` : puzzles.length}</span>
          </div>
          <div className="puzzle-list">
            {isRush ? (
              renderPuzzleItem(puzzle, puzzleIndex)
            ) : mode === 'daily' ? (
              renderPuzzleItem(puzzles[dailyPuzzleIndex], dailyPuzzleIndex)
            ) : (
              Object.entries(groupedPuzzles).map(([contentStatus, mateInGroups]) => (
                <section className="content-group" key={contentStatus}>
                  <div className="content-title">
                    <span>{formatContentStatus(contentStatus)}</span>
                    <strong>
                      {Object.values(mateInGroups).reduce((total, groupItems) => total + groupItems.length, 0)}
                    </strong>
                  </div>
                  {Object.entries(mateInGroups).map(([groupMateIn, groupItems]) => (
                    <section className="puzzle-group" key={`${contentStatus}-${groupMateIn}`}>
                      <div className="group-title">
                        <span>Mate in {groupMateIn}</span>
                        <strong>{groupItems.length}</strong>
                      </div>
                      <div className="group-items">
                        {groupItems.map(({ item, index }) => renderPuzzleItem(item, index))}
                      </div>
                    </section>
                  ))}
                </section>
              ))
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
                  <p className="eyebrow">Combo</p>
                  <strong>{rushStats.currentCombo}</strong>
                  <span>{rushMultiplier.toFixed(2)}x multiplier</span>
                </div>
                <div>
                  <p className="eyebrow">Next Boost</p>
                  <strong>{nextRushMultiplier.label}</strong>
                  <span>{nextRushMultiplier.detail}</span>
                </div>
              </div>
              <div className="stats-grid rush-grid">
                <div className="stat">
                  <Zap size={18} />
                  <span>{activeRushModeConfig.shortLabel}</span>
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
                  <span>{activeRushModeBestScore}</span>
                  <small>Mode Best</small>
                </div>
                <div className="stat">
                  <BadgeCheck size={18} />
                  <span>{rushLives}/{activeRushModeConfig.lives}</span>
                  <small>Lives</small>
                </div>
                <div className="stat">
                  <Sparkles size={18} />
                  <span>{rushStats.totalScore}</span>
                  <small>Score</small>
                </div>
                <div className="stat">
                  <BadgeCheck size={18} />
                  <span>{rushStats.solved}</span>
                  <small>Solved</small>
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
                  <span>{rushPuzzleMistakes}/{RUSH_MAX_PUZZLE_ATTEMPTS}</span>
                  <small>Attempts</small>
                </div>
                <div className="stat">
                  <SkipForward size={18} />
                  <span>{rushStats.skips}</span>
                  <small>Skips</small>
                </div>
              </div>
            </>
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

          <div className="actions">
            {isRush && rushReveal ? (
              <button type="button" className="primary-action" onClick={continueRushAfterReveal}>
                <ChevronRight size={18} />
                {rushLives <= 0 ? 'Finish Run' : 'Next Puzzle'}
              </button>
            ) : (
              <>
                <button type="button" className="primary-action" onClick={showHint} disabled={isComplete || isRush}>
                  <Lightbulb size={18} />
                  Hint
                </button>
                {isRush ? (
                  <button type="button" className="secondary-action" onClick={skipRushPuzzle}>
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
            <span>{isRush ? `${activeRushModeConfig.label} best ${activeRushModeBestScore}` : `Best score ${stats.bestScore}`}</span>
          </div>
        </aside>
      </section>

      {isComplete && result && (
        <section className="result-screen" role="dialog" aria-modal="true" aria-label="Puzzle result">
          {result.mode === 'rush' ? (
            <div className="result-panel">
              <Zap size={42} />
              <p className="eyebrow">Rush complete</p>
              <h2>{result.rushModeLabel || 'Rush Mode'}</h2>
              <div className="result-score">
                <Sparkles size={20} />
                <strong>{result.totalScore}</strong>
                <span>score</span>
              </div>
              <div className="rush-result-highlights" aria-label="Rush highlights">
                <div className="highlight-card rank">
                  <span>Rank</span>
                  <strong>{result.rank}</strong>
                </div>
                <div className={`highlight-card ${result.isNewBest ? 'new-best' : ''}`}>
                  <span>{result.isNewBest ? 'New Best' : 'Mode Best'}</span>
                  <strong>{result.bestModeScore}</strong>
                </div>
                <div className={`highlight-card ${result.isNewBestCombo ? 'new-best' : ''}`}>
                  <span>{result.isNewBestCombo ? 'New Best Combo' : 'Best Combo'}</span>
                  <strong>{result.bestCombo}</strong>
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
                <div><span>Rush mode</span><strong>{result.rushModeLabel || 'Rush Mode'}</strong></div>
                <div><span>Score</span><strong>{result.totalScore}</strong></div>
                <div><span>Rush rank</span><strong>{result.rank}</strong></div>
                <div><span>Next rank</span><strong>{result.rankProgress.next?.rank || 'Max rank'}</strong></div>
                <div><span>Needed for next</span><strong>{result.rankProgress.next ? result.rankProgress.pointsNeeded : 0}</strong></div>
                <div><span>Lives remaining</span><strong>{result.livesRemaining}</strong></div>
                <div><span>Puzzles solved</span><strong>{result.solved}</strong></div>
                <div><span>Perfect solves</span><strong>{result.perfectSolves}</strong></div>
                <div><span>Misses</span><strong>{result.misses}</strong></div>
                <div><span>Mistakes</span><strong>{result.mistakes}</strong></div>
                <div><span>Skips</span><strong>{result.skips}</strong></div>
                <div><span>Best combo</span><strong>{result.bestCombo}</strong></div>
                <div><span>Mode best score</span><strong>{result.bestModeScore}</strong></div>
                <div><span>Average solve time</span><strong>{formatTime(result.averageSolveTime)}</strong></div>
              </div>
              {getRushBadges(result).length > 0 && (
                <div className="badge-row" aria-label="Rush badges">
                  {getRushBadges(result).map((badge) => (
                    <span className="achievement-badge" key={badge}>{badge}</span>
                  ))}
                </div>
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
                          <small>Wrong moves: {item.wrongMoveCount ?? 0}/{RUSH_MAX_PUZZLE_ATTEMPTS}</small>
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
              {stats.rushHistory.length > 0 && (
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
                <button type="button" className="primary-action" onClick={startRush}>
                  <Zap size={18} />
                  Play {selectedRushModeConfig.shortLabel} Again
                </button>
                <button type="button" className="secondary-action" onClick={copyResult}>
                  <Copy size={18} />
                  {copyStatus}
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
