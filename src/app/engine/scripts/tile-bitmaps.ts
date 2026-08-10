import {
  OBJECT_BRICK,
  OBJECT_CROSSBAR,
  OBJECT_LAVA_1,
  OBJECT_LAVA_2,
  OBJECT_LAVA_3,
  OBJECT_LAVA_4,
  OBJECT_LAVA_5,
  OBJECT_LAVA_6,
  OBJECT_LAVA_7,
  OBJECT_LAVA_8,
  OBJECT_STAIRS,
} from '../../data/sprites';
import { GameObject } from '../game-object/game-object';
import { IEngineState } from '../i-engine-state';
import { ITileBitmapDescription, TileBitmapType } from '../i-tile-bitmap-description';
import { BACKGROUND_LAYER } from '../screen/screen.constants';
import { BitmapRenderer } from './bitmap-renderer';
import { BitmapSpriteRenderer } from './bitmap-sprite-renderer';
import { MapHelper } from './map.helper';
import { ObjectPosition } from './object-position';
import { TileType } from './tile-map';

export const TILE_BITMAPS: Partial<Record<TileType, ITileBitmapDescription>> = {
  [TileType.Brick]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_BRICK },
  [TileType.Stairs]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_STAIRS },
  [TileType.Crossbar]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_CROSSBAR },
  [TileType.Lava]: {
    bitmapType: TileBitmapType.Animated,
    animatedBitmap: {
      bitmap: [OBJECT_LAVA_1, OBJECT_LAVA_2, OBJECT_LAVA_3, OBJECT_LAVA_4, OBJECT_LAVA_5, OBJECT_LAVA_6, OBJECT_LAVA_7, OBJECT_LAVA_8],
      framePerSecond: 4,
    },
  },
};

/** Builds the renderable GameObject for a tile cell (used both for the initial level layout and for tiles placed at runtime, e.g. by BuilderScript). */
export function createTileGameObject(engineState: IEngineState, column: number, row: number, type: TileType): GameObject | undefined {
  const tileBitmap = TILE_BITMAPS[type];
  if (!tileBitmap) {
    return undefined;
  }

  return GameObject.create(`Tile-${column}-${row}`, engineState, MapHelper.mapToScreen(column, row), [
    (gameObject) => ObjectPosition.create(gameObject, column, row),
    (gameObject) =>
      tileBitmap.bitmapType === TileBitmapType.Static
        ? BitmapRenderer.create(gameObject, tileBitmap.staticBitmap!, BACKGROUND_LAYER)
        : BitmapSpriteRenderer.create(
            gameObject,
            { bitmap: tileBitmap.animatedBitmap!.bitmap, framePerSecond: tileBitmap.animatedBitmap!.framePerSecond },
            BACKGROUND_LAYER,
          ),
  ]);
}
