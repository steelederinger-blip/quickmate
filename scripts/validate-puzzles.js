import { Chess } from 'chess.js';
import { puzzles } from '../src/puzzles.js';

const expectedCounts = new Map([
  [1, 10],
  [2, 10],
  [3, 5],
  [4, 5],
  [5, 3],
  [6, 1],
  [7, 1],
]);
const expectedContentStatusCounts = new Map([
  ['dev', 25],
  ['candidate', 10],
]);
const expectedCandidateCounts = new Map([
  [1, 5],
  [2, 5],
]);

const counts = new Map();
const candidateCounts = new Map();
const contentStatusCounts = new Map();
const themeCounts = new Map();
const mateInThemePatternCounts = new Map();
const ids = new Set();
const warnings = [];
const allowedContentStatuses = new Set(['dev', 'candidate', 'approved', 'rejected']);
const requiredFields = ['id', 'title', 'fen', 'sideToMove', 'mateIn', 'solution', 'difficulty', 'rating'];
const optionalStringFields = ['contentStatus', 'source'];
const optionalStringArrayFields = ['theme', 'themes', 'modeFit', 'qualityNotes'];
const THEME_IMBALANCE_RATIO = 0.35;
const MAX_MATEIN_THEME_PATTERN_COUNT = 2;

function fail(message) {
  throw new Error(message);
}

function warn(message) {
  warnings.push(message);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function isNonEmptyStringArray(value) {
  return Array.isArray(value) && value.length > 0 && value.every(isNonEmptyString);
}

function getThemeList(puzzle) {
  if (isNonEmptyStringArray(puzzle.themes)) {
    return puzzle.themes;
  }

  if (isNonEmptyStringArray(puzzle.theme)) {
    return puzzle.theme;
  }

  return [];
}

for (const puzzle of puzzles) {
  for (const field of requiredFields) {
    if (puzzle[field] === undefined || puzzle[field] === null || puzzle[field] === '') {
      fail(`${puzzle.id || 'unknown puzzle'} is missing ${field}`);
    }
  }

  if (ids.has(puzzle.id)) {
    fail(`Duplicate puzzle id: ${puzzle.id}`);
  }

  ids.add(puzzle.id);

  for (const field of optionalStringFields) {
    if (puzzle[field] !== undefined && !isNonEmptyString(puzzle[field])) {
      fail(`${puzzle.id} optional field ${field} must be a non-empty string when provided`);
    }
  }

  if (puzzle.contentStatus !== undefined && !allowedContentStatuses.has(puzzle.contentStatus)) {
    fail(`${puzzle.id} contentStatus must be one of: ${[...allowedContentStatuses].join(', ')}`);
  }

  for (const field of optionalStringArrayFields) {
    if (puzzle[field] !== undefined) {
      if (!isNonEmptyStringArray(puzzle[field])) {
        fail(`${puzzle.id} optional field ${field} must be an array of non-empty strings when provided`);
      }
    }
  }

  const contentStatus = puzzle.contentStatus || 'unspecified';
  const themes = getThemeList(puzzle);

  if (contentStatus === 'candidate') {
    if (!isNonEmptyString(puzzle.source)) {
      fail(`${puzzle.id} candidate puzzle is missing source`);
    }

    if (!isNonEmptyStringArray(puzzle.modeFit)) {
      fail(`${puzzle.id} candidate puzzle is missing modeFit`);
    }

    if (!isNonEmptyStringArray(puzzle.qualityNotes)) {
      fail(`${puzzle.id} candidate puzzle is missing qualityNotes`);
    }

    if (!isNonEmptyStringArray(puzzle.themes)) {
      fail(`${puzzle.id} candidate puzzle is missing themes`);
    }
  }

  if (contentStatus !== 'dev' && !isNonEmptyString(puzzle.source)) {
    warn(`${puzzle.id} is ${contentStatus} but is missing source`);
  }

  if (!isNonEmptyStringArray(puzzle.modeFit)) {
    warn(`${puzzle.id} is missing modeFit`);
  }

  if (!isNonEmptyStringArray(puzzle.themes)) {
    warn(`${puzzle.id} is missing themes`);
  }

  if (!Array.isArray(puzzle.solution) || puzzle.solution.length !== puzzle.mateIn * 2 - 1) {
    fail(`${puzzle.id} solution length does not match mateIn ${puzzle.mateIn}`);
  }

  const game = new Chess(puzzle.fen);
  const expectedTurn = puzzle.sideToMove === 'white' ? 'w' : 'b';

  if (game.turn() !== expectedTurn) {
    fail(`${puzzle.id} sideToMove does not match FEN`);
  }

  if (contentStatus === 'candidate' && puzzle.mateIn > 1) {
    const immediateMates = game.moves().filter((move) => move.includes('#'));

    if (immediateMates.length > 0) {
      fail(`${puzzle.id} is marked mate-in-${puzzle.mateIn} but has immediate mate(s): ${immediateMates.join(', ')}`);
    }
  }

  for (const san of puzzle.solution) {
    const move = game.move(san);

    if (!move) {
      fail(`${puzzle.id} has invalid SAN move ${san}`);
    }
  }

  if (!game.isCheckmate()) {
    fail(`${puzzle.id} final position is not checkmate`);
  }

  counts.set(puzzle.mateIn, (counts.get(puzzle.mateIn) || 0) + 1);
  contentStatusCounts.set(contentStatus, (contentStatusCounts.get(contentStatus) || 0) + 1);

  if (contentStatus === 'candidate') {
    candidateCounts.set(puzzle.mateIn, (candidateCounts.get(puzzle.mateIn) || 0) + 1);
  }

  for (const theme of themes) {
    themeCounts.set(theme, (themeCounts.get(theme) || 0) + 1);
  }

  const themePattern = themes.length > 0 ? [...themes].sort().join('|') : 'missing-themes';
  const mateInThemePattern = `mate-in-${puzzle.mateIn}:${themePattern}`;
  mateInThemePatternCounts.set(mateInThemePattern, (mateInThemePatternCounts.get(mateInThemePattern) || 0) + 1);
}

for (const [theme, count] of themeCounts) {
  if (count / puzzles.length > THEME_IMBALANCE_RATIO) {
    warn(`Theme "${theme}" appears in ${count}/${puzzles.length} puzzles; review repeated theme imbalance`);
  }
}

for (const [pattern, count] of mateInThemePatternCounts) {
  if (count > MAX_MATEIN_THEME_PATTERN_COUNT) {
    warn(`${count} puzzles share ${pattern}; review repeated mateIn/theme pattern`);
  }
}

for (const [mateIn, expectedCount] of expectedCounts) {
  const actualCount = counts.get(mateIn) || 0;

  if (actualCount !== expectedCount) {
    fail(`Expected ${expectedCount} mate-in-${mateIn} puzzles, found ${actualCount}`);
  }
}

for (const [status, expectedCount] of expectedContentStatusCounts) {
  const actualCount = contentStatusCounts.get(status) || 0;

  if (actualCount !== expectedCount) {
    fail(`Expected ${expectedCount} ${status} puzzles, found ${actualCount}`);
  }
}

for (const [mateIn, expectedCount] of expectedCandidateCounts) {
  const actualCount = candidateCounts.get(mateIn) || 0;

  if (actualCount !== expectedCount) {
    fail(`Expected ${expectedCount} candidate mate-in-${mateIn} puzzles, found ${actualCount}`);
  }
}

if (puzzles.length !== 35) {
  fail(`Expected 35 puzzles, found ${puzzles.length}`);
}

const contentStatusSummary = [...contentStatusCounts.entries()]
  .map(([status, count]) => `${status}: ${count}`)
  .join(', ');

console.log(`Validated ${puzzles.length} puzzles. Every solution ends in checkmate.`);
console.log(`Content status counts: ${contentStatusSummary}.`);

if (warnings.length > 0) {
  console.warn(`Validation warnings: ${warnings.length}`);
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
}
