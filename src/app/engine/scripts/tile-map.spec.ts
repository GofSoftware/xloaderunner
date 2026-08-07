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

  it('should not treat crossbar, lava, player-start, or gold tiles as solid ground', () => {
    tileMap.setTile(1, 3, TileType.Crossbar);
    tileMap.setTile(2, 3, TileType.Lava);
    tileMap.setTile(6, 3, TileType.PlayerStart);
    tileMap.setTile(7, 3, TileType.Gold);

    expect(tileMap.isSolid(1, 3)).toBe(false);
    expect(tileMap.isSolid(2, 3)).toBe(false);
    expect(tileMap.isSolid(6, 3)).toBe(false);
    expect(tileMap.isSolid(7, 3)).toBe(false);
  });

  it('should only treat brick tiles as walls, not stairs, crossbars, lava, player-start, gold, or empty cells', () => {
    tileMap.setTile(1, 3, TileType.Brick);
    tileMap.setTile(2, 3, TileType.Stairs);
    tileMap.setTile(4, 3, TileType.Crossbar);
    tileMap.setTile(5, 3, TileType.Lava);
    tileMap.setTile(6, 3, TileType.PlayerStart);
    tileMap.setTile(7, 3, TileType.Gold);

    expect(tileMap.isWall(1, 3)).toBe(true);
    expect(tileMap.isWall(2, 3)).toBe(false);
    expect(tileMap.isWall(3, 3)).toBe(false);
    expect(tileMap.isWall(4, 3)).toBe(false);
    expect(tileMap.isWall(5, 3)).toBe(false);
    expect(tileMap.isWall(6, 3)).toBe(false);
    expect(tileMap.isWall(7, 3)).toBe(false);
  });

  it('should convert pixel coordinates to the containing cell when checking for walls', () => {
    tileMap.setTileAtPixel(8, 24, TileType.Brick);

    expect(tileMap.isWallAtPixel(9, 27)).toBe(true);
    expect(tileMap.isWallAtPixel(0, 0)).toBe(false);
  });

  it('should only treat lava tiles as dangerous, not brick, stairs, crossbar, player-start, gold, or empty cells', () => {
    tileMap.setTile(1, 3, TileType.Lava);
    tileMap.setTile(2, 3, TileType.Brick);
    tileMap.setTile(4, 3, TileType.Stairs);
    tileMap.setTile(5, 3, TileType.Crossbar);
    tileMap.setTile(6, 3, TileType.PlayerStart);
    tileMap.setTile(7, 3, TileType.Gold);

    expect(tileMap.isDangerous(1, 3)).toBe(true);
    expect(tileMap.isDangerous(0, 3)).toBe(false);
    expect(tileMap.isDangerous(2, 3)).toBe(false);
    expect(tileMap.isDangerous(4, 3)).toBe(false);
    expect(tileMap.isDangerous(5, 3)).toBe(false);
    expect(tileMap.isDangerous(6, 3)).toBe(false);
    expect(tileMap.isDangerous(7, 3)).toBe(false);
  });

  it('should convert pixel coordinates to the containing cell when checking for danger', () => {
    tileMap.setTileAtPixel(8, 24, TileType.Lava);

    expect(tileMap.isDangerousAtPixel(9, 27)).toBe(true);
    expect(tileMap.isDangerousAtPixel(0, 0)).toBe(false);
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
