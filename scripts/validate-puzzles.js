import { Chess } from 'chess.js';
import { puzzles } from '../src/puzzles.js';

const expectedCounts = new Map([
  [1, 5],
  [2, 5],
  [3, 5],
  [4, 5],
  [5, 3],
  [6, 1],
  [7, 1],
]);

const counts = new Map();
const ids = new Set();
const requiredFields = ['id', 'title', 'fen', 'sideToMove', 'mateIn', 'solution', 'difficulty', 'rating', 'theme'];

function fail(message) {
  throw new Error(message);
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

  if (!Array.isArray(puzzle.theme) || puzzle.theme.length === 0) {
    fail(`${puzzle.id} theme must be a non-empty array`);
  }

  if (!Array.isArray(puzzle.solution) || puzzle.solution.length !== puzzle.mateIn * 2 - 1) {
    fail(`${puzzle.id} solution length does not match mateIn ${puzzle.mateIn}`);
  }

  const game = new Chess(puzzle.fen);
  const expectedTurn = puzzle.sideToMove === 'white' ? 'w' : 'b';

  if (game.turn() !== expectedTurn) {
    fail(`${puzzle.id} sideToMove does not match FEN`);
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
}

for (const [mateIn, expectedCount] of expectedCounts) {
  const actualCount = counts.get(mateIn) || 0;

  if (actualCount !== expectedCount) {
    fail(`Expected ${expectedCount} mate-in-${mateIn} puzzles, found ${actualCount}`);
  }
}

if (puzzles.length !== 25) {
  fail(`Expected 25 puzzles, found ${puzzles.length}`);
}

console.log(`Validated ${puzzles.length} puzzles. Every solution ends in checkmate.`);
