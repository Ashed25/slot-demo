export type Payline = [
  number,
  number,
  number,
  number,
  number,
]

export const PAYLINES: Payline[] = [
  // 1–3: straight horizontal lines
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [2, 2, 2, 2, 2],

  // 4–5: large V / inverted V
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],

  // 6–7: shallow V patterns
  [0, 0, 1, 0, 0],
  [2, 2, 1, 2, 2],

  // 8–9: opposite shallow patterns
  [1, 0, 0, 0, 1],
  [1, 2, 2, 2, 1],

  // 10–11: zigzags
  [0, 1, 0, 1, 0],
  [2, 1, 2, 1, 2],

  // 12–13
  [1, 0, 1, 0, 1],
  [1, 2, 1, 2, 1],

  // 14–15
  [0, 1, 1, 1, 0],
  [2, 1, 1, 1, 2],

  // 16–17
  [1, 1, 0, 1, 1],
  [1, 1, 2, 1, 1],

  // 18–19
  [0, 0, 1, 2, 2],
  [2, 2, 1, 0, 0],

  // 20
  [0, 1, 2, 2, 2],
]