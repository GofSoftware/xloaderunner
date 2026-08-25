import {
  OBJECT_BEAM_ROTATOR,
  OBJECT_BRICK,
  OBJECT_CROSSBAR,
  OBJECT_EMITTER_BLUE_DOWN,
  OBJECT_EMITTER_BLUE_LEFT,
  OBJECT_EMITTER_BLUE_RIGHT,
  OBJECT_EMITTER_BLUE_UP,
  OBJECT_EMITTER_RED_DOWN,
  OBJECT_EMITTER_RED_LEFT,
  OBJECT_EMITTER_RED_RIGHT,
  OBJECT_EMITTER_RED_UP,
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
} from '../data/sprites';
import { GameObject } from '../../engine/game-object/game-object';
import { Script } from '../../engine/game-object/script';
import { IEngineState } from '../../engine/i-engine-state';
import { ITileBitmapDescription, TileBitmapType } from '../../engine/i-tile-bitmap-description';
import { MIDDLE_TILE_LAYER, BACKGROUND_LAYER } from '../../engine/screen/screen.constants';
import { BitmapRenderer } from '../../engine/scripts/bitmap-renderer';
import { BitmapSpriteRenderer } from '../../engine/scripts/bitmap-sprite-renderer';
import { EMITTER_INFO_BY_TILE_TYPE, EmitterScript } from './emitter/emitter-script';
import { GoldItem } from './gold-item';
import { MapHelper } from '../../engine/helpers/map.helper';
import { ObjectPosition } from '../../engine/scripts/object-position';
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
  [TileType.EmitterRedLeft]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_EMITTER_RED_LEFT },
  [TileType.EmitterRedRight]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_EMITTER_RED_RIGHT },
  [TileType.EmitterRedUp]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_EMITTER_RED_UP },
  [TileType.EmitterRedDown]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_EMITTER_RED_DOWN },
  [TileType.EmitterBlueLeft]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_EMITTER_BLUE_LEFT },
  [TileType.EmitterBlueRight]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_EMITTER_BLUE_RIGHT },
  [TileType.EmitterBlueUp]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_EMITTER_BLUE_UP },
  [TileType.EmitterBlueDown]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_EMITTER_BLUE_DOWN },
  [TileType.BeamRotator]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_BEAM_ROTATOR },
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
  const emitterInfo = EMITTER_INFO_BY_TILE_TYPE[type];
  if (emitterInfo) {
    scriptFactories.push((gameObject) => EmitterScript.create(gameObject, emitterInfo.color, emitterInfo.direction));
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
