import { TileType } from '../scripts/tile-map/tile-map-types';

const ___ = TileType.Empty;
const Brk = TileType.Brick;
const Str = TileType.Stairs;
const Crb = TileType.Crossbar;
const Lav = TileType.Lava;
const PlS = TileType.PlayerStart;
const EnS = TileType.EnemyStart;
const Gld = TileType.Gold;
const EmL = TileType.EmitterGreenLeft;
const EmR = TileType.EmitterGreenRight;
const EmU = TileType.EmitterGreenUp;
const EmD = TileType.EmitterGreenDown;
const EbL = TileType.EmitterBlueLeft;
const EbR = TileType.EmitterBlueRight;
const EbU = TileType.EmitterBlueUp;
const EbD = TileType.EmitterBlueDown;
const RRB = TileType.MirrorRB;
const RLt = TileType.MirrorLB;
const RRT = TileType.MirrorRT;
const RLT = TileType.MirrorLT;
const BSB = TileType.BeamSwitchBlue;
const GGT = TileType.GoldenGates;

// prettier-ignore
export const LEVEL_TILES_ARR: TileType[][] = [
  [___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___],
  [___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___],
  [___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, EbL],
  [___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___],
  [Str, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___],
  [Str, ___, ___, ___, ___, EbD, ___, ___, ___, ___, ___, ___, ___, EmD, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___],
  [Str, Brk, Brk, Brk, Gld, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, Str, RRT, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, EmL, Brk, Str],
  [Str, ___, ___, ___, Gld, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, Str],
  [Str, ___, ___, ___, Gld, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, Str],
  [Str, Crb, Crb, Crb, Crb, Crb, Crb, Crb, Crb, Crb, Crb, Crb, Crb, Crb, Crb, Crb, Crb, Str, Crb, Crb, Crb, Crb, Crb, Crb, Crb, Crb, Crb, Crb, Crb, Crb, Crb, Str],
  [Str, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, Str],
  [Str, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, Str],
  [Str, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, Str],
  [Str, Crb, Crb, Crb, Crb, Crb, Crb, Str, Brk, ___, EmU, ___, ___, ___, PlS, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, Str],
  [Str, ___, ___, ___, ___, ___, ___, Str, Str, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Str, Brk, ___, ___, ___, ___, Brk, ___, ___, ___, ___, ___, ___, ___, ___, Brk],
  [Str, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, BSB, ___, ___, ___, ___, ___, ___, ___, ___, ___],
  [Str, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, Brk, ___, Brk, ___, Brk, ___, Brk, ___],
  [Str, ___, ___, ___, ___, ___, Brk, EbR, Str, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, Brk, Brk, Brk, Brk, Brk, Brk, Brk, ___],
  [Str, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, Brk, Brk, Brk, EnS, Brk, Brk, Brk, ___],
  [Str, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, Crb, Crb, Crb, Crb, Str, ___, ___, ___, ___, ___, ___, ___, ___, Brk, Brk, ___, Brk, Brk, ___, ___],
  [Str, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, ___, Brk, Brk, ___, Brk, Brk, ___, ___],
  [Str, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, ___, Brk, Brk, ___, Brk, Brk, ___, ___],
  [Str, Gld, ___, ___, ___, ___, Gld, ___, Str, ___, ___, Str, Brk, ___, ___, ___, Str, ___, ___, ___, Gld, ___, EbU, ___, ___, GGT, ___, ___, ___, GGT, ___, ___],
  [Brk, Brk, Lav, Lav, Lav, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk],
];
