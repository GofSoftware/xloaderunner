import { CELL_SIZE, SCREEN_HEIGHT, SCREEN_WIDTH } from '../../../engine/screen/screen.constants';

export const MAP_COLUMNS = Math.floor(SCREEN_WIDTH / CELL_SIZE);
export const MAP_ROWS = Math.floor(SCREEN_HEIGHT / CELL_SIZE);

export enum TileType {
  Empty = 'Empty',
  Brick = 'Brick',
  // A temporarily-blasted-open Brick: walkable/fallable-through like Empty (it's intentionally not
  // special-cased in isWall/isSolid/isClimbable/isDangerous below) but not Empty itself, so
  // BuilderScript still refuses to build over it.
  BlastedBrick = 'BlastedBrick',
  Stairs = 'Stairs',
  Crossbar = 'Crossbar',
  Lava = 'Lava',
  PlayerStart = 'PlayerStart',
  Gold = 'Gold',
  // A fixed beam emitter - color and facing direction are both baked into the tile type so a level
  // can specify them just by which type it places. Deliberately not special-cased in
  // isWall/isSolid/isClimbable/isDangerous/isRemovable below - only Brick/Lava/Player/Enemy stop a
  // beam (see EmitterManager), and emitters are level fixtures, not something BuilderScript can
  // remove.
  EmitterGreenLeft = 'EmitterGreenLeft',
  EmitterGreenRight = 'EmitterGreenRight',
  EmitterGreenUp = 'EmitterGreenUp',
  EmitterGreenDown = 'EmitterGreenDown',
  EmitterBlueLeft = 'EmitterBlueLeft',
  EmitterBlueRight = 'EmitterBlueRight',
  EmitterBlueUp = 'EmitterBlueUp',
  EmitterBlueDown = 'EmitterBlueDown',
  MirrorRB = 'MirrorRB',
  MirrorLB = 'MirrorLB',
  MirrorRT = 'MirrorRT',
  MirrorLT = 'MirrorLT',
  MirrorB = 'MirrorB',
  MirrorL = 'MirrorL',
  MirrorT = 'MirrorT',
  MirrorR = 'MirrorR',
  BeamSwitchBlue = 'BeamSwitchBlue',
  BeamSwitchGreen = 'BeamSwitchGreen',
  GoldenGates = 'GoldenGates',
}
