import { Wt, Rd, Gr, Bl, __, Lg, Mg, Or, Ol, Yl } from '../engine/screen/screen.constants';

// 8x8 sprite frames for a standing man tapping one foot: rest -> foot lifts -> foot stamps down.
export const MAN_MOVING_LEFT_FRAME_1: number[][] = [
  [__, __, Wt, Wt, __, __, __, __],
  [__, __, Bl, Wt, __, __, __, __],
  [__, __, Wt, Wt, __, __, __, __],
  [__, __, Wt, Wt, Wt, __, __, __],
  [__, Wt, __, Wt, Wt, Wt, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, Wt, __, __, __, __],
  [__, __, Wt, __, Wt, __, __, __],
];

export const MAN_MOVING_LEFT_FRAME_2: number[][] = [
  [__, __, Wt, Wt, __, __, __, __],
  [__, __, Bl, Wt, __, __, __, __],
  [__, __, Wt, Wt, __, __, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, Wt, Wt, __, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, Wt, __, __, __, __],
  [__, __, __, Wt, __, __, __, __],
];

export const MAN_MOVING_LEFT_FRAME_3: number[][] = [
  [__, __, Wt, Wt, __, __, __, __],
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
  [__, __, __, __, Wt, Wt, __, __],
  [__, __, __, __, Wt, Bl, __, __],
  [__, __, __, __, Wt, Wt, __, __],
  [__, __, __, Wt, Wt, Wt, __, __],
  [__, __, Wt, Wt, Wt, __, Wt, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, __, Wt, Wt, __, __],
  [__, __, __, Wt, __, Wt, __, __],
];


export const MAN_MOVING_RIGHT_FRAME_2: number[][] = [
  [__, __, __, __, Wt, Wt, __, __],
  [__, __, __, __, Wt, Bl, __, __],
  [__, __, __, __, Wt, Wt, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, Wt, Wt, Wt, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, __, Wt, __, __, __],
  [__, __, __, __, Wt, __, __, __],
];


export const MAN_MOVING_RIGHT_FRAME_3: number[][] = [
  [__, __, __, __, Wt, Wt, __, __],
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
  [__, __, __, Wt, Wt, __, Wt, __],
  [__, __, Wt, Wt, Wt, Wt, __, __],
  [__, Wt, __, Wt, Wt, __, __, __],
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
  [__, Wt, __, Wt, Wt, __, __, __],
  [__, __, Wt, Wt, Wt, Wt, __, __],
  [__, __, __, Wt, Wt, __, Wt, __],
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

export const MAN_ON_CROSSBAR_FRAME_1: number[][] = [
  [__, __, __, Wt, Wt, __, __, __],
  [__, Wt, __, Bl, Wt, __, Wt, __],
  [__, Wt, __, Wt, Wt, __, Wt, __],
  [__, __, Wt, Wt, Wt, Wt, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, __, __, Wt, __, __],
  [__, __, Wt, __, __, Wt, __, __],
];

export const MAN_ON_CROSSBAR_FRAME_2: number[][] = [
  [__, __, __, Wt, Wt, __, __, __],
  [__, Wt, __, Wt, Wt, __, Wt, __],
  [__, Wt, __, Wt, Wt, __, Wt, __],
  [__, __, Wt, Wt, Wt, Wt, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, __, __, Wt, __, __],
  [__, __, Wt, __, __, Wt, __, __],
];

export const MAN_ON_CROSSBAR_FRAME_3: number[][] = [
  [__, __, __, Wt, Wt, __, __, __],
  [__, Wt, __, Wt, Bl, __, Wt, __],
  [__, Wt, __, Wt, Wt, __, Wt, __],
  [__, __, Wt, Wt, Wt, Wt, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, __, __, Wt, __, __],
  [__, __, Wt, __, __, Wt, __, __],
];

export const MAN_ON_CROSSBAR_MOVE_LEFT_FRAME_1: number[][] = [
  [__, __, __, Wt, Wt, __, __, __],
  [Wt, __, __, Bl, Wt, Wt, __, __],
  [__, Wt, __, Wt, Wt, Wt, __, __],
  [__, __, Wt, Wt, Wt, Wt, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, __, __, Wt, __, __],
  [__, __, Wt, __, __, Wt, __, __],
];

export const MAN_ON_CROSSBAR_MOVE_LEFT_FRAME_2: number[][] = [
  [__, __, __, Wt, Wt, __, __, __],
  [__, Wt, __, Bl, Wt, Wt, __, __],
  [__, Wt, __, Wt, Wt, Wt, __, __],
  [__, __, Wt, Wt, Wt, Wt, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, __, __, Wt, __, __],
  [__, __, Wt, __, __, Wt, __, __],
];

export const MAN_ON_CROSSBAR_MOVE_LEFT_FRAME_3: number[][] = [
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, Bl, Wt, __, Wt, __],
  [__, __, Wt, Wt, Wt, Wt, __, __],
  [__, __, Wt, Wt, Wt, Wt, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, __, __, Wt, __, __],
  [__, __, Wt, __, __, Wt, __, __],
];


export const MAN_ON_CROSSBAR_MOVE_RIGHT_FRAME_1: number[][] = [
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, Wt, Bl, __, __, Wt],
  [__, __, Wt, Wt, Wt, __, Wt, __],
  [__, __, Wt, Wt, Wt, Wt, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, __, __, Wt, __, __],
  [__, __, Wt, __, __, Wt, __, __],
];

export const MAN_ON_CROSSBAR_MOVE_RIGHT_FRAME_2: number[][] = [
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, Wt, Bl, __, Wt, __],
  [__, __, Wt, Wt, Wt, __, Wt, __],
  [__, __, Wt, Wt, Wt, Wt, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, __, __, Wt, __, __],
  [__, __, Wt, __, __, Wt, __, __],
];

export const MAN_ON_CROSSBAR_MOVE_RIGHT_FRAME_3: number[][] = [
  [__, __, __, Wt, Wt, __, __, __],
  [__, Wt, __, Wt, Bl, Wt, __, __],
  [__, __, Wt, Wt, Wt, Wt, __, __],
  [__, __, Wt, Wt, Wt, Wt, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, __, Wt, Wt, __, __, __],
  [__, __, Wt, __, __, Wt, __, __],
  [__, __, Wt, __, __, Wt, __, __],
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

export const OBJECT_CROSSBAR: number[][] = [
  [Mg, Mg, Mg, Mg, Mg, Mg, Mg, Mg],
  [__, __, __, __, __, __, __, __],
  [__, __, __, __, __, __, __, __],
  [__, __, __, __, __, __, __, __],
  [__, __, __, __, __, __, __, __],
  [__, __, __, __, __, __, __, __],
  [__, __, __, __, __, __, __, __],
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

export const OBJECT_LAVA_1: number[][] = [
  [__, __, Or, Or, Or, __, __, __],
  [__, Or, Ol, Ol, Ol, Or, __, __],
  [Or, Ol, Or, Ol, Ol, Ol, Or, Or],
  [Ol, Ol, Ol, Or, Ol, Or, Ol, Ol],
  [Ol, Ol, Ol, Or, Ol, Or, Or, Ol],
  [Ol, Ol, Or, Or, Ol, Or, Ol, Or],
  [Ol, Or, Ol, Ol, Or, Ol, Ol, Ol],
  [Ol, Or, Ol, Ol, Ol, Or, Ol, Ol],
];

export const OBJECT_LAVA_2: number[][] = [
  [__, Or, Or, Or, __, __, __, __],
  [Or, Ol, Ol, Ol, Or, __, __, __],
  [Ol, Or, Ol, Ol, Ol, Or, Or, Or],
  [Ol, Ol, Or, Ol, Or, Ol, Ol, Ol],
  [Ol, Ol, Or, Ol, Or, Or, Ol, Ol],
  [Ol, Or, Or, Ol, Or, Ol, Or, Ol],
  [Or, Ol, Ol, Or, Ol, Ol, Ol, Ol],
  [Or, Ol, Ol, Ol, Or, Ol, Ol, Ol],
];

export const OBJECT_LAVA_3: number[][] = [
  [Or, Or, Or, __, __, __, __, __],
  [Ol, Ol, Ol, Or, __, __, __, Or],
  [Or, Ol, Ol, Ol, Or, Or, Or, Ol],
  [Ol, Or, Ol, Or, Ol, Ol, Ol, Ol],
  [Ol, Or, Ol, Or, Or, Ol, Ol, Ol],
  [Or, Or, Ol, Or, Ol, Or, Ol, Ol],
  [Ol, Ol, Or, Ol, Ol, Ol, Ol, Or],
  [Ol, Ol, Ol, Or, Ol, Ol, Ol, Or],
];

export const OBJECT_LAVA_4: number[][] = [
  [Or, Or, __, __, __, __, __, Or],
  [Ol, Ol, Or, __, __, __, Or, Ol],
  [Ol, Ol, Ol, Or, Or, Or, Ol, Or],
  [Or, Ol, Or, Ol, Ol, Ol, Ol, Ol],
  [Or, Ol, Or, Or, Ol, Ol, Ol, Ol],
  [Or, Ol, Or, Ol, Or, Ol, Ol, Or],
  [Ol, Or, Ol, Ol, Ol, Ol, Or, Ol],
  [Ol, Ol, Or, Ol, Ol, Ol, Or, Ol],
];

export const OBJECT_LAVA_5: number[][] = [
  [Or, __, __, __, __, __, Or, Or],
  [Ol, Or, __, __, __, Or, Ol, Ol],
  [Ol, Ol, Or, Or, Or, Ol, Or, Ol],
  [Ol, Or, Ol, Ol, Ol, Ol, Ol, Or],
  [Ol, Or, Or, Ol, Ol, Ol, Ol, Or],
  [Ol, Or, Ol, Or, Ol, Ol, Or, Or],
  [Or, Ol, Ol, Ol, Ol, Or, Ol, Ol],
  [Ol, Or, Ol, Ol, Ol, Or, Ol, Ol],
];

export const OBJECT_LAVA_6: number[][] = [
  [__, __, __, __, __, Or, Or, Or],
  [Or, __, __, __, Or, Ol, Ol, Ol],
  [Ol, Or, Or, Or, Ol, Or, Ol, Ol],
  [Or, Ol, Ol, Ol, Ol, Ol, Or, Ol],
  [Or, Or, Ol, Ol, Ol, Ol, Or, Ol],
  [Or, Ol, Or, Ol, Ol, Or, Or, Ol],
  [Ol, Ol, Ol, Ol, Or, Ol, Ol, Or],
  [Or, Ol, Ol, Ol, Or, Ol, Ol, Ol],
];

export const OBJECT_LAVA_7: number[][] = [
  [__, __, __, __, Or, Or, Or, __],
  [__, __, __, Or, Ol, Ol, Ol, Or],
  [Or, Or, Or, Ol, Or, Ol, Ol, Ol],
  [Ol, Ol, Ol, Ol, Ol, Or, Ol, Or],
  [Or, Ol, Ol, Ol, Ol, Or, Ol, Or],
  [Ol, Or, Ol, Ol, Or, Or, Ol, Or],
  [Ol, Ol, Ol, Or, Ol, Ol, Or, Ol],
  [Ol, Ol, Ol, Or, Ol, Ol, Ol, Or],
];

export const OBJECT_LAVA_8: number[][] = [
  [__, __, __, Or, Or, Or, __, __],
  [__, __, Or, Ol, Ol, Ol, Or, __],
  [Or, Or, Ol, Or, Ol, Ol, Ol, Or],
  [Ol, Ol, Ol, Ol, Or, Ol, Or, Ol],
  [Ol, Ol, Ol, Ol, Or, Ol, Or, Or],
  [Or, Ol, Ol, Or, Or, Ol, Or, Ol],
  [Ol, Ol, Or, Ol, Ol, Or, Ol, Ol],
  [Ol, Ol, Or, Ol, Ol, Ol, Or, Ol],
];
export const OBJECT_QUESTION: number[][] = [
  [__, __, Ol, __, Ol, __, __, __],
  [__, __, __, __, __, __, __, __],
  [Ol, __, __, Or, __, __, Ol, __],
  [__, __, Or, __, Or, __, __, __],
  [__, __, __, __, Or, __, __, __],
  [__, __, __, Or, __, __, __, __],
  [__, __, __, __, __, __, __, __],
  [__, __, __, Or, __, __, __, __],
];
export const OBJECT_EXCLAMATION: number[][] = [
  [__, __, Ol, __, __, Ol, __, __],
  [__, __, __, __, __, __, __, __],
  [Ol, __, __, Or, Or, __, __, Ol],
  [__, __, __, Or, Or, __, __, __],
  [__, __, __, Or, Or, __, __, __],
  [__, __, __, __, __, __, __, __],
  [__, __, __, Or, Or, __, __, __],
  [__, __, __, __, __, __, __, __],
];

export const OBJECT_HEART: number[][] = [
  [__, __, __, __, __, __, __, __],
  [__, Rd, Rd, __, Rd, Rd, __, __],
  [Rd, Rd, Rd, Rd, Rd, Rd, Rd, __],
  [Rd, Rd, Rd, Rd, Rd, Rd, Rd, __],
  [__, Rd, Rd, Rd, Rd, Rd, __, __],
  [__, __, Rd, Rd, Rd, __, __, __],
  [__, __, __, Rd, __, __, __, __],
  [__, __, __, __, __, __, __, __],
];

export const OBJECT_GOLD: number[][] = [
  [__, __, __, __, __, __, __, __],
  [__, __, __, __, __, __, __, __],
  [__, __, __, __, __, __, __, __],
  [__, __, __, __, __, __, __, __],
  [__, Yl, Yl, Yl, Yl, Yl, Yl, __],
  [__, Yl, __, __, __, __, Yl, __],
  [__, Yl, __, __, __, __, Yl, __],
  [__, Yl, Yl, Yl, Yl, Yl, Yl, __],
];

export const OBJECT_GOLD_HUD: number[][] = [
  [__, __, __, __, __, __, __, __],
  [__, __, __, __, __, __, __, __],
  [__, Yl, Yl, Yl, Yl, Yl, Yl, __],
  [__, Yl, __, __, __, __, Yl, __],
  [__, Yl, __, __, __, __, Yl, __],
  [__, Yl, Yl, Yl, Yl, Yl, Yl, __],
  [__, __, __, __, __, __, __, __],
  [__, __, __, __, __, __, __, __],
];

export const OBJECT_SMOKE_UP_1: number[][] = [
  [__, __, __, __, __, __, __, __],
  [__, __, Wt, __, Wt, __, __, __],
  [__, __, __, __, __, __, __, __],
  [__, __, __, Wt, __, __, __, __],
  [__, __, __, __, __, Wt, __, __],
  [__, __, Wt, __, Wt, __, __, __],
  [__, __, __, __, __, __, __, __],
  [__, __, __, __, __, __, __, __],
];

export const OBJECT_SMOKE_UP_2: number[][] = [
  [__, Wt, __, __, __, Wt, __, __],
  [__, __, __, Wt, __, __, __, __],
  [__, __, __, __, Wt, __, Wt, __],
  [__, __, Wt, __, __, __, __, __],
  [__, __, __, Wt, __, __, Wt, __],
  [__, __, __, __, __, __, __, __],
  [__, Wt, __, __, Wt, __, __, __],
  [__, __, __, __, __, __, __, __],
];

export const OBJECT_SMOKE_UP_3: number[][] = [
  [__, Wt, __, Wt, __, __, __, __],
  [__, __, __, __, __, __, __, __],
  [__, __, __, __, __, Wt, __, Wt],
  [Wt, __, __, __, __, __, __, __],
  [__, __, __, __, __, __, __, __],
  [__, __, __, __, __, __, __, Wt],
  [__, __, __, __, __, __, __, __],
  [Wt, __, __, __, Wt, __, __, __],
];

export const OBJECT_SMOKE_UP_4: number[][] = [
  [__, __, __, __, __, __, __, __],
  [__, __, __, __, __, __, __, __],
  [__, __, __, __, __, __, __, __],
  [__, __, __, __, __, __, Wt, __],
  [__, __, __, __, __, __, __, __],
  [__, __, __, __, __, __, __, __],
  [__, __, __, __, __, __, __, __],
  [__, __, __, __, __, __, __, __],
];
