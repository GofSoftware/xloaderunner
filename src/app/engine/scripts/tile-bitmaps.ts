import {
  OBJECT_BRICK,
  OBJECT_CROSSBAR,
  OBJECT_GOLD,
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
import { Script } from '../game-object/script';
import { IEngineState } from '../i-engine-state';
import { ITileBitmapDescription, TileBitmapType } from '../i-tile-bitmap-description';
import { MIDDLE_TILE_LAYER, BACKGROUND_LAYER } from '../screen/screen.constants';
import { BitmapRenderer } from './bitmap-renderer';
import { BitmapSpriteRenderer } from './bitmap-sprite-renderer';
import { GoldItem } from './gold-item';
import { MapHelper } from './map.helper';
import { ObjectPosition } from './object-position';
import { TileType } from './tile-map';

export const TILE_BITMAPS: Partial<Record<TileType, ITileBitmapDescription>> = {
  [TileType.Brick]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_BRICK },
  [TileType.Stairs]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_STAIRS },
  [TileType.Crossbar]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_CROSSBAR },
  [TileType.Gold]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_GOLD, layer: MIDDLE_TILE_LAYER },
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

  const layer = tileBitmap.layer ?? MIDDLE_TILE_LAYER;
  const scriptFactories: ((gameObject: GameObject) => Script)[] = [(gameObject) => ObjectPosition.create(gameObject, column, row)];
  if (type === TileType.Gold) {
    scriptFactories.push((gameObject) => GoldItem.create(gameObject));
  }
  scriptFactories.push((gameObject) =>
    tileBitmap.bitmapType === TileBitmapType.Static
      ? BitmapRenderer.create(gameObject, tileBitmap.staticBitmap!, layer)
      : BitmapSpriteRenderer.create(
          gameObject,
          { bitmap: tileBitmap.animatedBitmap!.bitmap, framePerSecond: tileBitmap.animatedBitmap!.framePerSecond },
          layer,
        ),
  );

  return GameObject.create(`Tile-${column}-${row}`, engineState, MapHelper.mapToScreen(column, row), scriptFactories);
}
