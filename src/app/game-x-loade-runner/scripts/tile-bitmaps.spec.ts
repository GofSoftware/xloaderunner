import { createTileGameObject } from './tile-bitmaps';
import { ObjectPosition } from './object-position';
import { BitmapRenderer } from '../../engine/scripts/bitmap-renderer';
import { BitmapSpriteRenderer } from '../../engine/scripts/bitmap-sprite-renderer';
import { GoldItem } from './gold-item';
import { TileType } from './tile-map/tile-map-types';
import { EmitterScript, EMITTER_INFO_BY_TILE_TYPE } from './emitter/emitter-script';
import { MIDDLE_TILE_LAYER, BACKGROUND_LAYER, CELL_SIZE, LAYER_COUNT } from '../../engine/screen/screen.constants';
import { ScreenBuffer } from '../../engine/screen/screen-buffer';
import { IEngineState } from '../../engine/i-engine-state';

describe('createTileGameObject', () => {
  const engineState = {
    addGameObject: () => {},
    removeGameObject: () => {},
    getGameObjectByName: () => undefined,
  } as unknown as IEngineState;

  it('returns undefined for tile types with no visual representation', () => {
    expect(createTileGameObject(engineState, 1, 1, TileType.Empty)).toBeUndefined();
    expect(createTileGameObject(engineState, 1, 1, TileType.PlayerStart)).toBeUndefined();
  });

  it('positions a static tile at the given cell and gives it a bitmap renderer', () => {
    const gameObject = createTileGameObject(engineState, 3, 4, TileType.Brick)!;

    expect(gameObject.position).toEqual({ x: 3 * CELL_SIZE, y: 4 * CELL_SIZE });
    expect(gameObject.getScript(BitmapRenderer)).toBeDefined();
    expect(gameObject.getScript(ObjectPosition)!.column).toBe(3);
    expect(gameObject.getScript(ObjectPosition)!.row).toBe(4);
  });

  it('gives an animated tile a sprite renderer instead of a static one', () => {
    const gameObject = createTileGameObject(engineState, 2, 2, TileType.Lava)!;

    expect(gameObject.getScript(BitmapSpriteRenderer)).toBeDefined();
    expect(gameObject.getScript(BitmapRenderer)).toBeUndefined();
  });

  it('tags a gold tile with GoldItem so GoldScript can recognize it', () => {
    const gameObject = createTileGameObject(engineState, 5, 6, TileType.Gold)!;

    expect(gameObject.getScript(GoldItem)).toBeDefined();
    expect(gameObject.getScript(BitmapRenderer)).toBeDefined();
  });

  it('does not tag non-gold tiles with GoldItem', () => {
    const gameObject = createTileGameObject(engineState, 3, 4, TileType.Brick)!;

    expect(gameObject.getScript(GoldItem)).toBeUndefined();
  });

  it('draws gold on MIDDLE_TILE_LAYER, not the background layer', () => {
    const screenBuffer = ScreenBuffer.create(LAYER_COUNT);
    const renderEngineState = { ...engineState, screenBuffer } as unknown as IEngineState;
    const gameObject = createTileGameObject(renderEngineState, 5, 6, TileType.Gold)!;

    gameObject.start();
    gameObject.update();

    const region = (layer: number) =>
      screenBuffer.buffers[layer].slice(6 * CELL_SIZE, 7 * CELL_SIZE).map((row) => row.slice(5 * CELL_SIZE, 6 * CELL_SIZE));
    const isBlank = (pixels: number[][]) => pixels.every((row) => row.every((pixel) => pixel === 0));

    expect(isBlank(region(MIDDLE_TILE_LAYER))).toBe(false);
    expect(isBlank(region(BACKGROUND_LAYER))).toBe(true);
  });

  describe('emitters', () => {
    it('tags each emitter tile type with an EmitterScript carrying its color and direction', () => {
      for (const [type, info] of Object.entries(EMITTER_INFO_BY_TILE_TYPE)) {
        const gameObject = createTileGameObject(engineState, 1, 1, type as TileType)!;
        const emitter = gameObject.getScript(EmitterScript)!;

        expect(emitter).toBeDefined();
        expect(emitter.color).toBe(info!.color);
        expect(emitter.direction).toBe(info!.direction);
        expect(gameObject.getScript(BitmapRenderer)).toBeDefined();
      }
    });

    it('does not tag non-emitter tiles with EmitterScript', () => {
      const gameObject = createTileGameObject(engineState, 3, 4, TileType.Brick)!;

      expect(gameObject.getScript(EmitterScript)).toBeUndefined();
    });
  });
});
