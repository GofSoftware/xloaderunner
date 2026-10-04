import { Tile } from '../tile-map/tile-map-types';

export type MirrorDirection = Tile.MirrorRB | Tile.MirrorB | Tile.MirrorLB | Tile.MirrorL |
  Tile.MirrorLT | Tile.MirrorT | Tile.MirrorRT | Tile.MirrorR;

export const ORDERED_MIRROR_TILES: MirrorDirection[] = [
  Tile.MirrorRB, Tile.MirrorB, Tile.MirrorLB, Tile.MirrorL,
  Tile.MirrorLT, Tile.MirrorT, Tile.MirrorRT, Tile.MirrorR
];
