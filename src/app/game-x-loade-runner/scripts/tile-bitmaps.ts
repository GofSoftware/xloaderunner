import {
  OBJECT_MIRROR_B,
  OBJECT_MIRROR_L,
  OBJECT_MIRROR_LB,
  OBJECT_MIRROR_LT,
  OBJECT_MIRROR_R,
  OBJECT_MIRROR_RB,
  OBJECT_MIRROR_RT,
  OBJECT_MIRROR_T,
  OBJECT_BRICK,
  OBJECT_CROSSBAR,
  OBJECT_EMITTER_BLUE_DOWN,
  OBJECT_EMITTER_BLUE_LEFT,
  OBJECT_EMITTER_BLUE_RIGHT,
  OBJECT_EMITTER_BLUE_UP,
  OBJECT_EMITTER_GREEN_DOWN,
  OBJECT_EMITTER_GREEN_LEFT,
  OBJECT_EMITTER_GREEN_RIGHT,
  OBJECT_EMITTER_GREEN_UP,
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
  OBJECT_BEAM_SWITCH_BLUE,
} from '../data/sprites';
import { GameObject } from '../../engine/game-object/game-object';
import { Script } from '../../engine/game-object/script';
import { IEngineState } from '../../engine/i-engine-state';
import { ITileBitmapDescription, TileBitmapType } from '../../engine/i-tile-bitmap-description';
import { MIDDLE_TILE_LAYER, UPPER_EFFECT_LAYER, Yl } from '../../engine/screen/screen.constants';
import { BitmapRenderer } from '../../engine/scripts/bitmap-renderer';
import { BitmapSpriteRenderer } from '../../engine/scripts/bitmap-sprite-renderer';
import { EMITTER_INFO_BY_TILE_TYPE, EmitterScript } from './emitter/emitter-script';
import { GoldItem } from './gold-item';
import { MapHelper } from '../helpers/map.helper';
import { ObjectPosition } from './object-position';
import { MirrorScript } from './mirror/mirror-script';
import { TileType } from './tile-map/tile-map-types';
import { MirrorHelper } from './mirror/mirror-helper';
import { SwitchScript } from './switch-script';
import { ParticleScript } from '../../engine/scripts/particle-script';

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
  [TileType.EmitterGreenLeft]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_EMITTER_GREEN_LEFT },
  [TileType.EmitterGreenRight]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_EMITTER_GREEN_RIGHT },
  [TileType.EmitterGreenUp]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_EMITTER_GREEN_UP },
  [TileType.EmitterGreenDown]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_EMITTER_GREEN_DOWN },
  [TileType.EmitterBlueLeft]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_EMITTER_BLUE_LEFT },
  [TileType.EmitterBlueRight]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_EMITTER_BLUE_RIGHT },
  [TileType.EmitterBlueUp]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_EMITTER_BLUE_UP },
  [TileType.EmitterBlueDown]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_EMITTER_BLUE_DOWN },
  [TileType.MirrorRB]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_MIRROR_RB },
  [TileType.MirrorB]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_MIRROR_B },
  [TileType.MirrorLB]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_MIRROR_LB },
  [TileType.MirrorL]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_MIRROR_L },
  [TileType.MirrorLT]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_MIRROR_LT },
  [TileType.MirrorT]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_MIRROR_T },
  [TileType.MirrorRT]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_MIRROR_RT },
  [TileType.MirrorR]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_MIRROR_R },
  [TileType.BeamSwitchBlue]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_BEAM_SWITCH_BLUE },
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

  if (MirrorHelper.isMirror(type)) {
    scriptFactories.push((gameObject) => MirrorScript.create(gameObject));
  }

  if (type === TileType.BeamSwitchBlue) {
    scriptFactories.push((gameObject) => SwitchScript.create(gameObject));

    const ttlMin = 1;
    const ttlMax = 1.5;

    scriptFactories.push((gameObject) =>
      ParticleScript.create(
        gameObject,
        {
          numberOfParticles: 5,
          speed: 30,
          weight: 1,
          gravity: 40,
          direction: () => {
            const angle = Math.random() * Math.PI * 2;
            return { x: Math.cos(angle), y: -1 * Math.abs(Math.sin(angle)) };
          }, // or (i) => ({ x: Math.cos(i / 12 * Math.PI * 2), y: Math.sin(...) })
          color: Yl,
          colorOverrides: [(color, particle) => {
            const x = (particle.remainingLife * 255 / ttlMax); return x << 8 | 0x000000FF;
          }],
          timeToLive: { min: ttlMin, max: ttlMax },
        },
        UPPER_EFFECT_LAYER,
      ),
    );
  }

  return GameObject.create(`Tile-${column}-${row}`, engineState, MapHelper.mapToScreen(column, row), scriptFactories);
}
