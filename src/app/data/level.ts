import { ITile, TileType } from '../engine/scripts/tile-map';
import { CELL_SIZE, SCREEN_HEIGHT, SCREEN_WIDTH } from '../engine/screen/screen.constants';

export const LEVEL_TILES: ITile[] = [
  { column: 1, row: 3, type: TileType.Brick },
  { column: 2, row: 3, type: TileType.Brick },
  { column: 3, row: 3, type: TileType.Stairs },
  { column: 3, row: 4, type: TileType.Stairs },
  ...Array.from({ length: SCREEN_WIDTH / CELL_SIZE }, (_, i) => ({ column: i, row: SCREEN_HEIGHT / CELL_SIZE - 1, type: TileType.Brick })),
  ...Array.from({ length: (SCREEN_HEIGHT / CELL_SIZE) - 4 }, (_, i) => ({ column: 0, row: i + 3, type: TileType.Stairs })),
];
