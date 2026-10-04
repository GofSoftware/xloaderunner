import { Tile } from '../tile-map/tile-map-types';

export class MirrorHelper {
  public static isMirror(type: Tile): boolean {
    return type === Tile.MirrorRB ||
      type === Tile.MirrorB ||
      type === Tile.MirrorLB ||
      type === Tile.MirrorL ||
      type === Tile.MirrorLT ||
      type === Tile.MirrorT ||
      type === Tile.MirrorRT ||
      type === Tile.MirrorR;
  }
}
