import { TileType } from '../tile-map/tile-map-types';

export class MirrorHelper {
  public static isMirror(type: TileType): boolean {
    return type === TileType.MirrorRB ||
      type === TileType.MirrorB ||
      type === TileType.MirrorLB ||
      type === TileType.MirrorL ||
      type === TileType.MirrorLT ||
      type === TileType.MirrorT ||
      type === TileType.MirrorRT ||
      type === TileType.MirrorR;
  }
}
