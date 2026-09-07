export enum Direction {
  Left = 'Left',
  Right = 'Right',
  Up = 'Up',
  Down = 'Down',
}

const DIRECTION_SHIFT = new Map([
  [Direction.Left, { shiftColumn: -1, shiftRow: 0 }],
  [Direction.Right, { shiftColumn: 1, shiftRow: 0 }],
  [Direction.Up, { shiftColumn: 0, shiftRow: -1 }],
  [Direction.Down, { shiftColumn: 0, shiftRow: 1 }]
]);

export function shiftByDirection(column: number, row: number, direction: Direction): { column: number; row: number } {
  const {shiftColumn, shiftRow} = DIRECTION_SHIFT.get(direction) || {shiftColumn: 0, shiftRow: 0};
  return { column: column + shiftColumn, row: row + shiftRow};
}
