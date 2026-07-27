import { TileMap, TileType, MAP_COLUMNS, MAP_ROWS } from './tile-map';
import { GameObject } from '../game-object/game-object';
import { CELL_SIZE, SCREEN_HEIGHT, SCREEN_WIDTH } from '../screen/screen.constants';
import { IEngineState } from '../i-engine-state';

describe('TileMap', () => {
  let tileMap: TileMap;

  beforeEach(() => {
    const gameObject = GameObject.create('Map', {} as IEngineState, { x: 0, y: 0 }, [(go) => TileMap.create(go)]);
    tileMap = gameObject.getScript(TileMap)!;
  });

  it('should size the grid from the screen dimensions divided by the cell size', () => {
    expect(SCREEN_WIDTH % CELL_SIZE).toBe(0);
    expect(SCREEN_HEIGHT % CELL_SIZE).toBe(0);
    expect(MAP_COLUMNS).toBe(SCREEN_WIDTH / CELL_SIZE);
    expect(MAP_ROWS).toBe(SCREEN_HEIGHT / CELL_SIZE);
    expect(tileMap.columns).toBe(MAP_COLUMNS);
    expect(tileMap.rows).toBe(MAP_ROWS);
  });

  it('should report cells as empty and not solid until a tile is set', () => {
    expect(tileMap.getTile(1, 3)).toBe(TileType.Empty);
    expect(tileMap.isSolid(1, 3)).toBe(false);

    tileMap.setTile(1, 3, TileType.Brick);

    expect(tileMap.getTile(1, 3)).toBe(TileType.Brick);
    expect(tileMap.isSolid(1, 3)).toBe(true);
  });

  it('should convert pixel coordinates to the containing cell', () => {
    tileMap.setTileAtPixel(8, 24, TileType.Brick);

    expect(tileMap.getTile(1, 3)).toBe(TileType.Brick);
    expect(tileMap.getTileAtPixel(9, 27)).toBe(TileType.Brick);
    expect(tileMap.isSolidAtPixel(9, 27)).toBe(true);
    expect(tileMap.isSolidAtPixel(0, 0)).toBe(false);
  });

  it('should treat out-of-bounds cells as empty and ignore writes to them', () => {
    expect(tileMap.getTile(-1, 0)).toBe(TileType.Empty);
    expect(tileMap.getTile(MAP_COLUMNS, 0)).toBe(TileType.Empty);
    expect(tileMap.getTile(0, MAP_ROWS)).toBe(TileType.Empty);

    tileMap.setTile(-1, 0, TileType.Brick);
    tileMap.setTile(MAP_COLUMNS, 0, TileType.Brick);
  });

  it('should list every non-empty tile with its position', () => {
    tileMap.setTile(0, 3, TileType.Brick);
    tileMap.setTile(3, 4, TileType.Stairs);

    expect(tileMap.getTiles()).toEqual([
      { column: 0, row: 3, type: TileType.Brick },
      { column: 3, row: 4, type: TileType.Stairs },
    ]);
  });
});
