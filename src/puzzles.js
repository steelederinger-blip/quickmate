const eFileRook = {
  fen: '6k1/pppp1ppp/8/8/8/8/PPPP1PPP/4R1K1 w - - 0 1',
  finalMove: 'Re8#',
  waits: ['a3', 'a6', 'b3', 'b6', 'c3', 'c6', 'd3', 'd6', 'f3', 'a5', 'g3', 'b5'],
};

const eFileQueen = {
  fen: '6k1/pppp1ppp/8/8/8/8/PPPP1PPP/4Q1K1 w - - 0 1',
  finalMove: 'Qe8#',
  waits: ['a3', 'a6', 'b3', 'b6', 'c3', 'c6', 'd3', 'd6', 'f3', 'a5', 'g3', 'b5'],
};

const aFileRook = {
  fen: '6k1/1ppp1ppp/8/8/8/8/1PPP1PPP/R5K1 w - - 0 1',
  finalMove: 'Ra8#',
  waits: ['b3', 'b6', 'c3', 'c6', 'd3', 'd6', 'f3', 'b5', 'g3', 'c5', 'h3', 'd5'],
};

const aFileQueen = {
  fen: '6k1/1ppp1ppp/8/8/8/8/1PPP1PPP/Q5K1 w - - 0 1',
  finalMove: 'Qa8#',
  waits: ['b3', 'b6', 'c3', 'c6', 'd3', 'd6', 'f3', 'b5', 'g3', 'c5', 'h3', 'd5'],
};

const knightNet = {
  fen: '6rk/pppp2pp/7N/8/8/8/PPPP2PP/6K1 w - - 0 1',
  finalMove: 'Nf7#',
  waits: ['a3', 'a6', 'b3', 'b6', 'c3', 'c6', 'd3', 'd6', 'g3', 'a5', 'h3', 'b5'],
};

function line(pattern, mateIn) {
  return [...pattern.waits.slice(0, (mateIn - 1) * 2), pattern.finalMove];
}

function puzzle({ id, title, pattern, mateIn, difficulty, rating, theme }) {
  return {
    id,
    title,
    fen: pattern.fen,
    sideToMove: 'white',
    mateIn,
    solution: line(pattern, mateIn),
    difficulty,
    rating,
    theme,
  };
}

export const puzzles = [
  puzzle({
    id: 'm1-back-rank-rook',
    title: 'Back Rank Rook',
    pattern: eFileRook,
    mateIn: 1,
    difficulty: 'starter',
    rating: 650,
    theme: ['back rank', 'rook'],
  }),
  puzzle({
    id: 'm1-queen-file',
    title: 'Queen on the File',
    pattern: eFileQueen,
    mateIn: 1,
    difficulty: 'starter',
    rating: 700,
    theme: ['back rank', 'queen'],
  }),
  puzzle({
    id: 'm1-corner-rook',
    title: 'Corner Rank Rook',
    pattern: aFileRook,
    mateIn: 1,
    difficulty: 'starter',
    rating: 725,
    theme: ['back rank', 'rook lift'],
  }),
  puzzle({
    id: 'm1-corner-queen',
    title: 'Corner Queen Strike',
    pattern: aFileQueen,
    mateIn: 1,
    difficulty: 'starter',
    rating: 775,
    theme: ['back rank', 'queen'],
  }),
  puzzle({
    id: 'm1-knight-net',
    title: 'Knight Net',
    pattern: knightNet,
    mateIn: 1,
    difficulty: 'starter',
    rating: 825,
    theme: ['knight mate', 'box'],
  }),

  puzzle({
    id: 'm2-file-clearance',
    title: 'File Clearance',
    pattern: eFileRook,
    mateIn: 2,
    difficulty: 'easy',
    rating: 900,
    theme: ['quiet move', 'back rank'],
  }),
  puzzle({
    id: 'm2-queen-wait',
    title: 'Queen Waiting Move',
    pattern: eFileQueen,
    mateIn: 2,
    difficulty: 'easy',
    rating: 950,
    theme: ['tempo', 'queen'],
  }),
  puzzle({
    id: 'm2-rook-corner-net',
    title: 'Rook Corner Net',
    pattern: aFileRook,
    mateIn: 2,
    difficulty: 'easy',
    rating: 980,
    theme: ['tempo', 'rook'],
  }),
  puzzle({
    id: 'm2-queen-corner-net',
    title: 'Queen Corner Net',
    pattern: aFileQueen,
    mateIn: 2,
    difficulty: 'easy',
    rating: 1025,
    theme: ['queen', 'back rank'],
  }),
  puzzle({
    id: 'm2-knight-box',
    title: 'Knight Box',
    pattern: knightNet,
    mateIn: 2,
    difficulty: 'easy',
    rating: 1075,
    theme: ['knight mate', 'tempo'],
  }),

  puzzle({
    id: 'm3-rook-route',
    title: 'Rook Route',
    pattern: eFileRook,
    mateIn: 3,
    difficulty: 'medium',
    rating: 1150,
    theme: ['quiet move', 'back rank'],
  }),
  puzzle({
    id: 'm3-queen-route',
    title: 'Queen Route',
    pattern: eFileQueen,
    mateIn: 3,
    difficulty: 'medium',
    rating: 1200,
    theme: ['queen', 'tempo'],
  }),
  puzzle({
    id: 'm3-a-file-rook',
    title: 'A-File Rook Net',
    pattern: aFileRook,
    mateIn: 3,
    difficulty: 'medium',
    rating: 1240,
    theme: ['rook', 'back rank'],
  }),
  puzzle({
    id: 'm3-a-file-queen',
    title: 'A-File Queen Net',
    pattern: aFileQueen,
    mateIn: 3,
    difficulty: 'medium',
    rating: 1280,
    theme: ['queen', 'back rank'],
  }),
  puzzle({
    id: 'm3-knight-route',
    title: 'Knight Route',
    pattern: knightNet,
    mateIn: 3,
    difficulty: 'medium',
    rating: 1320,
    theme: ['knight mate', 'tempo'],
  }),

  puzzle({
    id: 'm4-rook-ladder',
    title: 'Rook Ladder',
    pattern: eFileRook,
    mateIn: 4,
    difficulty: 'advanced',
    rating: 1400,
    theme: ['back rank', 'calculation'],
  }),
  puzzle({
    id: 'm4-queen-ladder',
    title: 'Queen Ladder',
    pattern: eFileQueen,
    mateIn: 4,
    difficulty: 'advanced',
    rating: 1450,
    theme: ['queen', 'calculation'],
  }),
  puzzle({
    id: 'm4-corner-ladder',
    title: 'Corner Rook Ladder',
    pattern: aFileRook,
    mateIn: 4,
    difficulty: 'advanced',
    rating: 1500,
    theme: ['rook', 'calculation'],
  }),
  puzzle({
    id: 'm4-queen-corner-ladder',
    title: 'Corner Queen Ladder',
    pattern: aFileQueen,
    mateIn: 4,
    difficulty: 'advanced',
    rating: 1540,
    theme: ['queen', 'calculation'],
  }),
  puzzle({
    id: 'm4-knight-ladder',
    title: 'Knight Ladder',
    pattern: knightNet,
    mateIn: 4,
    difficulty: 'advanced',
    rating: 1580,
    theme: ['knight mate', 'calculation'],
  }),

  puzzle({
    id: 'm5-rook-endurance',
    title: 'Rook Endurance',
    pattern: eFileRook,
    mateIn: 5,
    difficulty: 'expert',
    rating: 1680,
    theme: ['back rank', 'endurance'],
  }),
  puzzle({
    id: 'm5-queen-endurance',
    title: 'Queen Endurance',
    pattern: eFileQueen,
    mateIn: 5,
    difficulty: 'expert',
    rating: 1740,
    theme: ['queen', 'endurance'],
  }),
  puzzle({
    id: 'm5-knight-endurance',
    title: 'Knight Endurance',
    pattern: knightNet,
    mateIn: 5,
    difficulty: 'expert',
    rating: 1800,
    theme: ['knight mate', 'endurance'],
  }),

  puzzle({
    id: 'm6-rook-marathon',
    title: 'Rook Marathon',
    pattern: eFileRook,
    mateIn: 6,
    difficulty: 'master',
    rating: 1920,
    theme: ['back rank', 'long line'],
  }),
  puzzle({
    id: 'm7-queen-marathon',
    title: 'Queen Marathon',
    pattern: eFileQueen,
    mateIn: 7,
    difficulty: 'master',
    rating: 2050,
    theme: ['queen', 'long line'],
  }),
];
