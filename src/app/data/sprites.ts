import { Wt, Rd, Gr, Bl, __, Lg, Mg } from '../engine/screen/screen.constants';

// 8x8 sprite frames for a standing man tapping one foot: rest -> foot lifts -> foot stamps down.
export const MAN_MOVING_LEFT_FRAME_1: number[][] = [
  [__, __, Wt, Wt, Wt, __, __, __],
  [__, __, Bl, Wt, __, __, __, __],
  [__, __, Wt, Wt, __, __, __, __],
  [__, __, Wt, Wt, Wt, __, __, __],
  [__, Wt, __, Wt, Wt, Wt, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, Wt, __, __, __, __],
  [__, __, Wt, __, Wt, __, __, __],
];

export const MAN_MOVING_LEFT_FRAME_2: number[][] = [
  [__, __, Wt, Wt, Wt, __, __, __],
  [__, __, Bl, Wt, __, __, __, __],
  [__, __, Wt, Wt, __, __, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, Wt, Wt, __, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, Wt, __, __, __, __],
  [__, __, __, Wt, __, __, __, __],
];

export const MAN_MOVING_LEFT_FRAME_3: number[][] = [
  [__, __, Wt, Wt, Wt, __, __, __],
  [__, __, Bl, Wt, __, __, __, __],
  [__, __, Wt, Wt, __, __, __, __],
  [__, __, __, Wt, Wt, Wt, __, __],
  [__, Wt, Wt, Wt, Wt, __, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, Wt, Wt, Wt, __, __],
  [__, __, Wt, __, __, __, __, __],
];

export const MAN_STANDING_FRAME_1: number[][] = [
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, Bl, Bl, __, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, Lg, Lg, Wt, __, __],
  [__, Wt, __, Lg, Lg, __, Wt, __],
  [__, __, __, Lg, Lg, __, __, __],
  [__, __, Wt, __, __, Wt, __, __],
  [__, __, Wt, __, __, Wt, __, __],
];

export const MAN_MOVING_RIGHT_FRAME_1: number[][] = [
  [__, __, __, Wt, Wt, Wt, __, __],
  [__, __, __, __, Wt, Bl, __, __],
  [__, __, __, __, Wt, Wt, __, __],
  [__, __, __, Wt, Wt, Wt, __, __],
  [__, __, Wt, Wt, Wt, __, Wt, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, __, Wt, Wt, __, __],
  [__, __, __, Wt, __, Wt, __, __],
];


export const MAN_MOVING_RIGHT_FRAME_2: number[][] = [
  [__, __, __, Wt, Wt, Wt, __, __],
  [__, __, __, __, Wt, Bl, __, __],
  [__, __, __, __, Wt, Wt, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, Wt, Wt, Wt, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, __, Wt, __, __, __],
  [__, __, __, __, Wt, __, __, __],
];


export const MAN_MOVING_RIGHT_FRAME_3: number[][] = [
  [__, __, __, Wt, Wt, Wt, __, __],
  [__, __, __, __, Wt, Bl, __, __],
  [__, __, __, __, Wt, Wt, __, __],
  [__, __, Wt, Wt, Wt, __, __, __],
  [__, __, __, Wt, Wt, Wt, Wt, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, Wt, Wt, Wt, __, __],
  [__, __, __, __, __, Wt, __, __],
];

export const MAN_STANDING_FRAME_2: number[][] = [
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, Bl, Bl, __, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, Wt, Wt, Wt, __, __],
  [__, Wt, __, Wt, Wt, __, Wt, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, __, __, Wt, __, __],
  [__, __, Wt, __, __, __, __, __],
];

export const MAN_FALLING_FRAME_1: number[][] = [
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, Bl, Bl, __, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, Wt, Wt, Wt, __, __],
  [__, Wt, __, Wt, Wt, __, Wt, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, __, __, Wt, __, __],
  [__, __, __, __, __, Wt, __, __],
];

export const MAN_FALLING_FRAME_2: number[][] = [
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, Bl, Bl, __, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, Wt, Wt, Wt, Wt, Wt, Wt, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, __, __, Wt, __, __],
  [__, __, Wt, __, __, Wt, __, __],
];

export const MAN_FALLING_FRAME_3: number[][] = [
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, Bl, Bl, __, __, __],
  [__, Wt, __, Wt, Wt, __, Wt, __],
  [__, __, Wt, Wt, Wt, Wt, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, __, __, Wt, __, __],
  [__, __, Wt, __, __, __, __, __],
];

export const MAN_CLIMBING_FRAME_1: number[][] = [
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, Wt, Wt, __, Wt, __],
  [__, __, Wt, Wt, Wt, Wt, __, __],
  [__, Wt, __, Wt, Wt, __, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, __, __, Wt, __, __],
  [__, __, Wt, __, __, __, __, __],
];

export const MAN_CLIMBING_FRAME_2: number[][] = [
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, Wt, Wt, Wt, Wt, Wt, Wt, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, __, __, Wt, __, __],
  [__, __, Wt, __, __, Wt, __, __],
];

export const MAN_CLIMBING_FRAME_3: number[][] = [
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, Wt, __, Wt, Wt, __, __, __],
  [__, __, Wt, Wt, Wt, Wt, __, __],
  [__, __, __, Wt, Wt, __, Wt, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, __, __, Wt, __, __],
  [__, __, __, __, __, Wt, __, __],
];

export const MAN_ON_STAIRS_FRAME_1: number[][] = [
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, Bl, Wt, __, __, __],
  [__, Wt, __, Wt, Wt, __, __, __],
  [__, __, Wt, Wt, Wt, Wt, __, __],
  [__, __, __, Wt, Wt, __, Wt, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, __, __, Wt, __, __],
  [__, __, __, __, __, Wt, __, __],
];

export const MAN_ON_STAIRS_FRAME_2: number[][] = [
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, Wt, __, Wt, Wt, __, __, __],
  [__, __, Wt, Wt, Wt, Wt, __, __],
  [__, __, __, Wt, Wt, __, Wt, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, __, __, Wt, __, __],
  [__, __, __, __, __, Wt, __, __],
];

export const MAN_ON_STAIRS_FRAME_3: number[][] = [
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, Wt, Bl, __, __, __],
  [__, Wt, __, Wt, Wt, __, __, __],
  [__, __, Wt, Wt, Wt, Wt, __, __],
  [__, __, __, Wt, Wt, __, Wt, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, __, __, Wt, __, __],
  [__, __, __, __, __, Wt, __, __],
];

export const OBJECT_EMPTY: number[][] = [
  [__, __, __, __, __, __, __, __],
  [__, __, __, __, __, __, __, __],
  [__, __, __, __, __, __, __, __],
  [__, __, __, __, __, __, __, __],
  [__, __, __, __, __, __, __, __],
  [__, __, __, __, __, __, __, __],
  [__, __, __, __, __, __, __, __],
  [__, __, __, __, __, __, __, __],
];

export const OBJECT_BRICK: number[][] = [
  [Rd, Rd, __, Rd, Rd, Rd, Rd, Rd],
  [Rd, Rd, __, Rd, Rd, Rd, Rd, Rd],
  [Rd, Rd, __, Rd, Rd, Rd, Rd, Rd],
  [__, __, __, __, __, __, __, __],
  [Rd, Rd, Rd, Rd, Rd, __, Rd, Rd],
  [Rd, Rd, Rd, Rd, Rd, __, Rd, Rd],
  [Rd, Rd, Rd, Rd, Rd, __, Rd, Rd],
  [__, __, __, __, __, __, __, __],
];

export const OBJECT_STAIRS: number[][] = [
  [__, Mg, Mg, Mg, Mg, Mg, Mg, __],
  [__, Mg, __, __, __, __, Mg, __],
  [__, Mg, Mg, Mg, Mg, Mg, Mg, __],
  [__, Mg, __, __, __, __, Mg, __],
  [__, Mg, Mg, Mg, Mg, Mg, Mg, __],
  [__, Mg, __, __, __, __, Mg, __],
  [__, Mg, Mg, Mg, Mg, Mg, Mg, __],
  [__, Mg, __, __, __, __, Mg, __],
];
