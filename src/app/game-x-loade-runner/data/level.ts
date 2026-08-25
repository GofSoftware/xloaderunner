import { TileType } from '../scripts/tile-map';

const Em = TileType.Empty;
const Br = TileType.Brick;
const St = TileType.Stairs;
const Cr = TileType.Crossbar;
const Lv = TileType.Lava;
const Ps = TileType.PlayerStart;
const Gd = TileType.Gold;
const EL = TileType.EmitterRedLeft;
const ER = TileType.EmitterRedRight;
const EU = TileType.EmitterRedUp;
const ED = TileType.EmitterRedDown;
const TL = TileType.EmitterBlueLeft;
const TR = TileType.EmitterBlueRight;
const TU = TileType.EmitterBlueUp;
const TD = TileType.EmitterBlueDown;
const Rt = TileType.BeamRotator;

export const LEVEL_TILES_ARR: TileType[][] = [
  [Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em],
  [Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em],
  [Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em],
  [Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em],
  [St, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em],
  [St, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em],
  [St, Br, Br, Br, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Rt, Em, Em, Em, Em, Em, Em, EL, Br, St],
  [St, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, St],
  [St, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, St],
  [St, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, Cr, St],
  [St, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, St],
  [St, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, St],
  [St, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, St],
  [St, Cr, Cr, Cr, Cr, Cr, Cr, St, Br, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, St],
  [St, Em, Em, Em, Em, Em, Em, St, St, Br, Br, Br, Br, Br, Br, Br, St, Br, ER, Em, Em, Em, Em, Em, Em, Em, Em, Br, Br, Br, Br, Br],
  [St, Em, Em, Em, Em, Em, Em, Em, St, Em, Em, Em, Em, Em, Em, Em, St, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em],
  [St, Em, Em, Em, Em, Em, Em, Em, St, Em, Em, Em, Em, Em, Em, Em, St, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em],
  [St, Em, Em, Em, Em, Em, Em, Em, St, Em, Em, Em, Em, Em, Em, Em, St, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em],
  [St, Em, Em, Em, Em, Em, Em, Em, St, Em, Em, Em, Em, Em, Em, Em, St, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em],
  [St, Em, Em, Em, Em, Em, Em, Em, St, Em, Em, Em, Em, Em, Em, Em, St, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em],
  [St, Em, Em, Em, Em, Em, Em, Em, St, Em, Em, Em, Em, Em, Em, Em, St, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em],
  [St, Em, Em, Em, Em, Ps, Em, Em, St, Em, Em, Em, Em, Em, Em, Em, St, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em, Em],
  [St, Gd, Em, Em, Em, Em, Gd, Em, St, Em, Em, St, Br, St, Em, Em, St, Em, Em, Em, Gd, Em, Em, Em, TU, Em, Em, Gd, Em, Em, Em, Em],
  [Br, Br, Lv, Lv, Lv, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br, Br],
];
