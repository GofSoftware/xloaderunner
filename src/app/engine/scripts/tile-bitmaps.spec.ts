import { createTileGameObject } from './tile-bitmaps';
import { ObjectPosition } from './object-position';
import { BitmapRenderer } from './bitmap-renderer';
import { BitmapSpriteRenderer } from './bitmap-sprite-renderer';
import { TileType } from './tile-map';
import { CELL_SIZE } from '../screen/screen.constants';
import { IEngineState } from '../i-engine-state';

describe('createTileGameObject', () => {
  const engineState = {
    addGameObject: () => {},
    removeGameObject: () => {},
    getGameObjectByName: () => undefined,
  } as unknown as IEngineState;

  it('returns undefined for tile types with no visual representation', () => {
    expect(createTileGameObject(engineState, 1, 1, TileType.Empty)).toBeUndefined();
    expect(createTileGameObject(engineState, 1, 1, TileType.PlayerStart)).toBeUndefined();
    expect(createTileGameObject(engineState, 1, 1, TileType.Gold)).toBeUndefined();
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
});
