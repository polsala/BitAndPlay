export const chordProgressions: number[][] = [
  [1, 5, 6, 4],
  [6, 4, 1, 5],
  [1, 4, 2, 5],
  [1, 3, 6, 7],
];

export const arpMotifs: number[][] = [
  [1, 5, 3, 5],
  [1, 3, 5, 8],
  [1, 5, 8, 5],
  [1, 4, 6, 5],
];

export const drumMotifs: Array<{ kick: number[]; snare: number[]; hat: number[] }> =
  [
    {
      kick: [0, 8],
      snare: [4, 12],
      hat: [0, 2, 4, 6, 8, 10, 12, 14],
    },
    {
      kick: [0, 7, 10],
      snare: [4, 12],
      hat: [0, 3, 4, 6, 8, 11, 12, 14],
    },
    {
      kick: [0, 6, 8],
      snare: [4, 12],
      hat: [0, 2, 4, 6, 8, 10, 12, 14],
    },
  ];
