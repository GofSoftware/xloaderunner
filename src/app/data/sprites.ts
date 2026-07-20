import { W, R, G, B, _ } from '../engine/screen/screen.constants';

// 8x8 sprite frames for a standing man tapping one foot: rest -> foot lifts -> foot stamps down.
export const MAN_STANDING_FRAME_1: number[][] = [
  [_, _, _, W, W, _, _, _],
  [_, _, _, W, W, _, _, _],
  [_, W, W, W, W, W, W, _],
  [_, _, _, W, W, _, _, _],
  [_, _, _, W, W, _, _, _],
  [_, _, _, W, W, _, _, _],
  [_, _, W, _, _, W, _, _],
  [_, _, W, _, _, W, _, _],
];

export const MAN_STANDING_FRAME_2: number[][] = [
  [_, _, _, W, W, _, _, _],
  [_, _, _, W, W, _, _, _],
  [_, W, W, W, W, W, W, _],
  [_, _, _, W, W, _, _, _],
  [_, _, _, W, W, _, _, _],
  [_, _, _, W, W, _, _, _],
  [_, _, W, _, W, _, _, _],
  [_, _, W, _, _, _, _, _],
];

export const MAN_STANDING_FRAME_3: number[][] = [
  [_, _, _, W, W, _, _, _],
  [_, _, _, W, W, _, _, _],
  [_, W, W, W, W, W, W, _],
  [_, _, _, W, W, _, _, _],
  [_, _, _, W, W, _, _, _],
  [_, _, _, W, W, _, _, _],
  [_, W, _, _, _, _, W, _],
  [_, W, _, _, _, _, W, _],
];

export const OBJECT_EMPTY: number[][] = [
  [_, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _],
];

export const OBJECT_BRICK: number[][] = [
  [R, R, _, R, R, R, R, R],
  [R, R, _, R, R, R, R, R],
  [R, R, _, R, R, R, R, R],
  [_, _, _, _, _, _, _, _],
  [R, R, R, R, R, _, R, R],
  [R, R, R, R, R, _, R, R],
  [R, R, R, R, R, _, R, R],
  [_, _, _, _, _, _, _, _],
];

export const OBJECT_STAIRS: number[][] = [
  [_, W, W, W, W, W, W, _],
  [_, W, _, _, _, _, W, _],
  [_, W, W, W, W, W, W, _],
  [_, W, _, _, _, _, W, _],
  [_, W, W, W, W, W, W, _],
  [_, W, _, _, _, _, W, _],
  [_, W, W, W, W, W, W, _],
  [_, W, _, _, _, _, W, _],
];
