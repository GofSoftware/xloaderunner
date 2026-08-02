import { TileType } from '../engine/scripts/tile-map';

const Em = TileType.Empty;
const Br = TileType.Brick;
const St = TileType.Stairs;
const Cr = TileType.Crossbar;
const Lv = TileType.Lava;

export const LEVEL_TILES_ARR: TileType[][] = [
  [Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em],
  [Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em],
  [Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em],
  [Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em],
  [St, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em],
  [St, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em],
  [St, Br, Br, Br, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, St],
  [St, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, St],
  [St, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, St],
  [St, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, St],
  [St, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, St],
  [St, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, St],
  [St, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, St],
  [St, Cr, Cr, Cr, Cr, Cr, Cr, St, Br, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, St],
  [St, Em, Em, Em, Em, Em, Em, St, St, Br, Br, Br, Br, Br, Br, Br, St, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Br, Br, Br, Br, Br],
  [St, Em, Em, Em, Em, Em, Em, Em, St, Em, Em, Em, Em, Em, Em, Em, St, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em],
  [St, Em, Em, Em, Em, Em, Em, Em, St, Em, Em, Em, Em, Em, Em, Em, St, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em],
  [St, Em, Em, Em, Em, Em, Em, Em, St, Em, Em, Em, Em, Em, Em, Em, St, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em],
  [St, Em, Em, Em, Em, Em, Em, Em, St, Em, Em, Em, Em, Em, Em, Em, St, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em],
  [St, Em, Em, Em, Em, Em, Em, Em, St, Em, Em, Em, Em, Em, Em, Em, St, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em],
  [St, Em, Em, Em, Em, Em, Em, Em, St, Em, Em, Em, Em, Em, Em, Em, St, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em],
  [St, Em, Em, Em, Em, Em, Em, Em, St, Em, Em, Em, Em, Em, Em, Em, St, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em],
  [St, Em, Em, Em, Em, Em, Em, Em, St, Em, Em, St, Br, St, Em, Em, St, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em],
  [Br, Br, Lv, Lv, Lv, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br],
];
