import { TileType } from '../tile-map/tile-map-types';

export type MirrorDirection = TileType.MirrorRB | TileType.MirrorB | TileType.MirrorLB | TileType.MirrorL |
  TileType.MirrorLT | TileType.MirrorT | TileType.MirrorRT | TileType.MirrorR;

export const ORDERED_MIRROR_TILES: MirrorDirection[] = [
  TileType.MirrorRB, TileType.MirrorB, TileType.MirrorLB, TileType.MirrorL,
  TileType.MirrorLT, TileType.MirrorT, TileType.MirrorRT, TileType.MirrorR
];
