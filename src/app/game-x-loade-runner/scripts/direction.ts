import { IMapPosition } from './tile-map/i-map-position';

export enum Direction {
  Left = 'Left',
  Right = 'Right',
  Up = 'Up',
  Down = 'Down',
}

export const DIRECTION_SHIFT: Readonly<Map<Direction, { shiftColumn: number; shiftRow: number }>> = new Map([
  [Direction.Left, { shiftColumn: -1, shiftRow: 0 }],
  [Direction.Right, { shiftColumn: 1, shiftRow: 0 }],
  [Direction.Up, { shiftColumn: 0, shiftRow: -1 }],
  [Direction.Down, { shiftColumn: 0, shiftRow: 1 }],
]);

export function shiftByDirection(column: number, row: number, direction: Direction): IMapPosition {
  const { shiftColumn, shiftRow } = DIRECTION_SHIFT.get(direction) || { shiftColumn: 0, shiftRow: 0 };
  return { column: column + shiftColumn, row: row + shiftRow };
}
