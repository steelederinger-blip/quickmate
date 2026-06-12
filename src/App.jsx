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
import { puzzles } from './puzzles.js';

const STORAGE_KEY = 'quickmate.stats.v1';
const RUSH_SECONDS = 180;
const SKIP_PENALTY = 100;
const RUSH_WRONG_MOVE_TIME_PENALTY = 3;
const ILLEGAL_MOVE_FEEDBACK = 'Illegal move.';
const WRONG_LEGAL_MOVE_FEEDBACK = 'Legal move, but it does not force mate.';
const PUZZLE_BEHAVIOR = {
  trainingMode: 'trainingMode',
  strictMode: 'strictMode',
};

const DEFAULT_STATS = {
  puzzlesSolved: 0,
  perfectSolves: 0,
  bestScore: 0,
  bestRushScore: 0,
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
  skips: 0,
  totalScore: 0,
  currentCombo: 0,
  bestCombo: 0,
  totalSolveSeconds: 0,
};

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

function getDailyPuzzleIndex(dateKey = getTodayKey()) {
  const hash = [...dateKey].reduce((total, char) => total + char.charCodeAt(0), 0);
  return hash % puzzles.length;
}

function shuffle(values) {
  return [...values].sort(() => Math.random() - 0.5);
}

function getRushEligiblePuzzleIndexes(solvedCount) {
  if (solvedCount <= 2) {
    return puzzles
      .map((puzzle, index) => ({ puzzle, index }))
      .filter(({ puzzle }) => puzzle.mateIn >= 1 && puzzle.mateIn <= 2)
      .map(({ index }) => index);
  }

  if (solvedCount <= 6) {
    return puzzles
      .map((puzzle, index) => ({ puzzle, index }))
      .filter(({ puzzle }) => puzzle.mateIn >= 2 && puzzle.mateIn <= 3)
      .map(({ index }) => index);
  }

  if (solvedCount <= 11) {
    return puzzles
      .map((puzzle, index) => ({ puzzle, index }))
      .filter(({ puzzle }) => puzzle.mateIn >= 3 && puzzle.mateIn <= 4)
      .map(({ index }) => index);
  }

  return puzzles
    .map((puzzle, index) => ({ puzzle, index }))
    .filter(({ puzzle }) => puzzle.mateIn >= 4)
    .map(({ index }) => index);
}

function buildRushQueue(solvedCount, usedPuzzleIds = []) {
  const eligibleIndexes = getRushEligiblePuzzleIndexes(solvedCount);
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
  if (score >= 10000) {
    return 'QuickMate Master';
  }

  if (score >= 7500) {
    return 'Checkmate Machine';
  }

  if (score >= 5000) {
    return 'Closer';
  }

  if (score >= 2500) {
    return 'Attacker';
  }

  if (score >= 1000) {
    return 'Tactician';
  }

  return 'Warmup';
}

function getRushBadges(result) {
  return [
    result.isNewBest ? 'New Best' : '',
    result.mistakes === 0 && result.skips === 0 ? 'Perfect Run' : '',
    result.skips === 0 ? 'No Skip' : '',
    result.bestCombo >= 5 ? 'Combo 5' : '',
    result.averageSolveTime < 20 && result.solved >= 3 ? 'Fast Hands' : '',
  ].filter(Boolean);
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

function loadStats() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : {};
    return {
      ...DEFAULT_STATS,
      ...parsed,
      bestRushScore: parsed.bestRushScore || 0,
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
  const [rushQueue, setRushQueue] = useState([]);
  const [rushQueueCursor, setRushQueueCursor] = useState(0);
  const [rushTimeLeft, setRushTimeLeft] = useState(RUSH_SECONDS);
  const [rushStats, setRushStats] = useState(DEFAULT_RUSH_STATS);
  const [rushUsedPuzzleIds, setRushUsedPuzzleIds] = useState([]);
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
  const boardIsInteractive = screen === 'game' && !isComplete && Boolean(expectedMove) && (!isRush || rushTimeLeft > 0);
  const rushElapsed = RUSH_SECONDS - rushTimeLeft;
  const rushMultiplier = getRushMultiplier(rushStats.currentCombo);
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
      const key = item.mateIn;

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push({ item, index });
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
    if (screen !== 'game' || !isRush || isComplete || rushTimeLeft <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setRushTimeLeft((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [screen, isRush, isComplete, rushTimeLeft]);

  useEffect(() => {
    if (screen === 'game' && isRush && !isComplete && rushTimeLeft === 0) {
      endRush();
    }
  }, [screen, isRush, isComplete, rushTimeLeft]);

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
    setFeedback(nextFeedback);
    setSelectedSquare(null);
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

  function startRush() {
    const queue = buildRushQueue(0, []);

    setRushQueue(queue);
    setRushQueueCursor(0);
    setRushTimeLeft(RUSH_SECONDS);
    setRushStats(DEFAULT_RUSH_STATS);
    setRushUsedPuzzleIds([]);
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
    const nextQueue = buildRushQueue(nextSolvedCount, nextUsedPuzzleIds);
    const nextCursor = 0;

    setRushQueue(nextQueue);
    setRushQueueCursor(nextCursor);
    resetPuzzle(nextQueue[nextCursor], 'rush', nextFeedback);
  }

  function endRush() {
    const averageSolveTime = rushStats.solved > 0
      ? Math.round(rushStats.totalSolveSeconds / rushStats.solved)
      : 0;
    const previousBestRushScore = stats.bestRushScore || 0;
    const rank = getRushRank(rushStats.totalScore);
    const nextResult = {
      mode: 'rush',
      solved: rushStats.solved,
      perfectSolves: rushStats.perfectSolves,
      mistakes: rushStats.mistakes,
      skips: rushStats.skips,
      totalScore: rushStats.totalScore,
      averageSolveTime,
      bestCombo: rushStats.bestCombo,
      rank,
      isNewBest: rushStats.totalScore > previousBestRushScore,
      bestRushScore: Math.max(stats.bestRushScore, rushStats.totalScore),
    };
    const historyEntry = {
      date: new Date().toISOString(),
      score: rushStats.totalScore,
      rank,
      solved: rushStats.solved,
      mistakes: rushStats.mistakes,
      skips: rushStats.skips,
      bestCombo: rushStats.bestCombo,
    };

    setIsComplete(true);
    setResult(nextResult);
    setFeedback('Rush complete.');
    setStats((currentStats) => {
      const nextStats = {
        ...currentStats,
        bestRushScore: Math.max(currentStats.bestRushScore || 0, rushStats.totalScore),
        rushGamesPlayed: (currentStats.rushGamesPlayed || 0) + 1,
        rushHistory: [historyEntry, ...(currentStats.rushHistory || [])].slice(0, 5),
      };

      saveStats(nextStats);
      return nextStats;
    });
  }

  function skipRushPuzzle() {
    if (!isRush || isComplete || rushTimeLeft <= 0) {
      return;
    }

    const nextUsedPuzzleIds = [...rushUsedPuzzleIds, puzzle.id];

    setRushStats((currentStats) => ({
      ...currentStats,
      skips: currentStats.skips + 1,
      currentCombo: 0,
      totalScore: Math.max(0, currentStats.totalScore - SKIP_PENALTY),
    }));
    setRushUsedPuzzleIds(nextUsedPuzzleIds);
    setRushTimeLeft((value) => Math.max(0, value - 5));
    advanceRushPuzzle(rushStats.solved, nextUsedPuzzleIds, 'Skipped. Combo broken. -100 score, -5 seconds.');
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
    const timeBonus = (isPerfectSolve ? 5 : 0) + (isFastSolve ? 3 : 0);
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
    setRushTimeLeft((value) => Math.min(RUSH_SECONDS, value + (isPerfectSolve ? 5 : 0) + (isFastSolve ? 3 : 0)));

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
        ? 'QuickMate Rush'
        : `QuickMate ${result.mode === 'daily' ? `Daily ${todayKey}` : puzzle.title}`,
      result.mode === 'rush'
        ? `${result.totalScore} points | ${result.solved} solved | ${result.skips} skips`
        : `${result.score} points in ${formatTime(result.seconds)}`,
      result.mode === 'rush'
        ? `${result.rank} | combo ${result.bestCombo} | avg ${formatTime(result.averageSolveTime)}`
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
    setMistakes((value) => value + 1);

    if (puzzleBehavior === PUZZLE_BEHAVIOR.strictMode && isRush) {
      const nextUsedPuzzleIds = [...rushUsedPuzzleIds, puzzle.id];

      setRushStats((currentStats) => ({
        ...currentStats,
        mistakes: currentStats.mistakes + 1,
        currentCombo: 0,
      }));
      setRushUsedPuzzleIds(nextUsedPuzzleIds);
      setRushTimeLeft((value) => Math.max(0, value - RUSH_WRONG_MOVE_TIME_PENALTY));
      advanceRushPuzzle(
        rushStats.solved,
        nextUsedPuzzleIds,
        `${WRONG_LEGAL_MOVE_FEEDBACK} Combo broken. -${RUSH_WRONG_MOVE_TIME_PENALTY} seconds.`,
      );
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
              <strong>{stats.bestRushScore || 0}</strong>
              <span>Best Rush</span>
            </div>
            <div>
              <strong>{stats.puzzlesSolved}</strong>
              <span>Total solved</span>
            </div>
          </div>

          <div className="mode-grid">
            <button type="button" className="mode-card featured" onClick={startDaily}>
              <CalendarDays size={24} />
              <span>
                <strong>Daily QuickMate</strong>
                <small>{dailyDone ? `${stats.currentDailyStreak} day streak` : `Today: ${puzzles[dailyPuzzleIndex].title}`}</small>
              </span>
              <Play size={20} />
            </button>

            <button type="button" className="mode-card" onClick={() => startPuzzle(0, 'ladder')}>
              <ListChecks size={24} />
              <span>
                <strong>Puzzle Ladder</strong>
                <small>{ladderSolvedCount}/{puzzles.length} solved</small>
              </span>
              <Play size={20} />
            </button>

            <button type="button" className="mode-card" onClick={openRushIntro}>
              <Zap size={24} />
              <span>
                <strong>Rush Mode</strong>
                <small>3 minutes | best {stats.bestRushScore || 0}</small>
              </span>
              <Play size={20} />
            </button>
          </div>

          <section className="about-panel" aria-label="About QuickMate">
            <button type="button" className="secondary-action" onClick={() => setShowHelp(true)}>
              <HelpCircle size={18} />
              How to Play
            </button>
            <div>
              <strong>QuickMate MVP</strong>
              <span>Puzzle Pack v1 | 25 puzzles</span>
            </div>
          </section>

          {stats.rushHistory.length > 0 && (
            <section className="history-panel" aria-label="Recent Rush runs">
              <div className="panel-header">
                <h2>Recent Rush</h2>
                <span>{stats.rushHistory.length}</span>
              </div>
              <div className="history-list">
                {stats.rushHistory.map((run) => (
                  <div className="history-item" key={`${run.date}-${run.score}`}>
                    <span>
                      <strong>{run.score}</strong>
                      <small>{run.rank}</small>
                    </span>
                    <span>
                      <strong>{run.solved}</strong>
                      <small>solved</small>
                    </span>
                    <span>
                      <strong>{run.bestCombo}</strong>
                      <small>combo</small>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </section>
        {showHelp && (
          <section className="result-screen" role="dialog" aria-modal="true" aria-label="How to Play">
            <div className="result-panel help-panel">
              <HelpCircle size={42} />
              <p className="eyebrow">How to Play</p>
              <h2>Find the mate</h2>
              <ul className="help-list">
                <li>User plays the mating side.</li>
                <li>Opponent responses are automatic.</li>
                <li>Illegal moves are rejected.</li>
                <li>Legal moves that do not force mate count as mistakes.</li>
                <li>Daily and Ladder let you retry wrong legal moves.</li>
                <li>Rush punishes wrong legal moves immediately.</li>
                <li>Faster clean solves score higher.</li>
                <li>Rush Mode is timed.</li>
                <li>Rush perfect solves build combo multipliers.</li>
                <li>Rush wrong moves and skips reset combo.</li>
                <li>Rush fast and perfect solves can add time.</li>
              </ul>
              <button type="button" className="primary-action" onClick={() => setShowHelp(false)}>
                Got it
              </button>
            </div>
          </section>
        )}
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
              <h1>Three minutes. No drift.</h1>
            </div>
            <div className="streak-pill">
              <Trophy size={17} />
              <span>Best {stats.bestRushScore || 0}</span>
            </div>
          </div>

          <div className="rush-rules">
            <div><strong>3:00</strong><span>Timed run</span></div>
            <div><strong>Mate</strong><span>Solve as many puzzles as possible</span></div>
            <div><strong>Combo</strong><span>Perfect solves build multipliers</span></div>
            <div><strong>Breaks</strong><span>Wrong legal moves and skips reset combo</span></div>
            <div><strong>Time</strong><span>Fast and perfect solves can add seconds</span></div>
          </div>

          <div className="actions">
            <button type="button" className="primary-action" onClick={startRush}>
              <Zap size={18} />
              Start Rush
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
    <main className={`app-shell ${isRush && rushTimeLeft <= 30 ? 'low-time' : ''}`}>
      <section className="topbar" aria-label="QuickMate controls">
        <div>
          <button type="button" className="text-button" onClick={() => setScreen('home')}>
            QuickMate
          </button>
          <h1>
            {mode === 'daily' ? 'Daily QuickMate' : ''}
            {mode === 'ladder' ? 'Puzzle Ladder' : ''}
            {mode === 'rush' ? 'Rush Mode' : ''}
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
              Object.entries(groupedPuzzles).map(([groupMateIn, groupItems]) => (
                <section className="puzzle-group" key={groupMateIn}>
                  <div className="group-title">
                    <span>Mate in {groupMateIn}</span>
                    <strong>{groupItems.length}</strong>
                  </div>
                  <div className="group-items">
                    {groupItems.map(({ item, index }) => renderPuzzleItem(item, index))}
                  </div>
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
            </div>
            <span className="badge">{puzzle.rating}</span>
          </div>

          {isRush ? (
            <div className="stats-grid rush-grid">
              <div className="stat">
                <Clock3 size={18} />
                <span>{formatTime(rushTimeLeft)}</span>
                <small>Remaining</small>
              </div>
              <div className="stat">
                <BadgeCheck size={18} />
                <span>{rushStats.solved}</span>
                <small>Solved</small>
              </div>
              <div className="stat">
                <Sparkles size={18} />
                <span>{rushStats.totalScore}</span>
                <small>Score</small>
              </div>
              <div className="stat">
                <XCircle size={18} />
                <span>{rushStats.mistakes}</span>
                <small>Mistakes</small>
              </div>
              <div className="stat">
                <SkipForward size={18} />
                <span>{rushStats.skips}</span>
                <small>Skips</small>
              </div>
              <div className="stat">
                <Zap size={18} />
                <span>{rushStats.currentCombo}</span>
                <small>{rushMultiplier.toFixed(2)}x combo</small>
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

          <div className="actions">
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
            <span>Best score {stats.bestScore}</span>
          </div>
        </aside>
      </section>

      {isComplete && result && (
        <section className="result-screen" role="dialog" aria-modal="true" aria-label="Puzzle result">
          {result.mode === 'rush' ? (
            <div className="result-panel">
              <Zap size={42} />
              <p className="eyebrow">Rush complete</p>
              <h2>3-minute run</h2>
              <div className="result-score">
                <Sparkles size={20} />
                <strong>{result.totalScore}</strong>
                <span>score</span>
              </div>
              <div className="score-breakdown" aria-label="Rush result">
                <div><span>Rush rank</span><strong>{result.rank}</strong></div>
                <div><span>Puzzles solved</span><strong>{result.solved}</strong></div>
                <div><span>Perfect solves</span><strong>{result.perfectSolves}</strong></div>
                <div><span>Mistakes</span><strong>{result.mistakes}</strong></div>
                <div><span>Skips</span><strong>{result.skips}</strong></div>
                <div><span>Best combo</span><strong>{result.bestCombo}</strong></div>
                <div><span>Best rush score</span><strong>{result.bestRushScore}</strong></div>
                <div><span>Average solve time</span><strong>{formatTime(result.averageSolveTime)}</strong></div>
              </div>
              {getRushBadges(result).length > 0 && (
                <div className="badge-row" aria-label="Rush badges">
                  {getRushBadges(result).map((badge) => (
                    <span className="achievement-badge" key={badge}>{badge}</span>
                  ))}
                </div>
              )}
              {stats.rushHistory.length > 0 && (
                <div className="result-history" aria-label="Recent Rush runs">
                  <h3>Recent runs</h3>
                  {stats.rushHistory.map((run) => (
                    <div className="history-item compact" key={`${run.date}-${run.score}`}>
                      <span>{run.score}</span>
                      <span>{run.rank}</span>
                      <span>{run.bestCombo} combo</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="actions">
                <button type="button" className="secondary-action" onClick={copyResult}>
                  <Copy size={18} />
                  {copyStatus}
                </button>
                <button type="button" className="primary-action" onClick={startRush}>
                  <Zap size={18} />
                  Play Rush Again
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
