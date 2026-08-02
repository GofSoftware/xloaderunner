import { Script } from '../game-object/script';
import { GameObject } from '../game-object/game-object';
import { CELL_SIZE, SCREEN_HEIGHT, SCREEN_WIDTH } from '../screen/screen.constants';

export const MAP_COLUMNS = Math.floor(SCREEN_WIDTH / CELL_SIZE);
export const MAP_ROWS = Math.floor(SCREEN_HEIGHT / CELL_SIZE);

export enum TileType {
  Empty = 'Empty',
  Brick = 'Brick',
  Stairs = 'Stairs',
  Crossbar = 'Crossbar',
  Lava = 'Lava',
}

export interface ITile {
  column: number;
  row: number;
  type: TileType;
}

export class TileMap extends Script {
  public static create(gameObject: GameObject): TileMap {
    return new TileMap(gameObject);
  }

  public readonly columns: number = MAP_COLUMNS;
  public readonly rows: number = MAP_ROWS;

  private readonly cells: TileType[][];

  private constructor(gameObject: GameObject) {
    super(gameObject);
    this.cells = Array.from({ length: this.rows }, () => new Array<TileType>(this.columns).fill(TileType.Empty));
  }

  public setTileAtPixel(x: number, y: number, type: TileType): void {
    this.setTile(Math.floor(x / CELL_SIZE), Math.floor(y / CELL_SIZE), type);
  }

  public setTile(column: number, row: number, type: TileType): void {
    if (this.isInBounds(column, row)) {
      this.cells[row][column] = type;
    }
  }

  public getTileAtPixel(x: number, y: number): TileType {
    return this.getTile(Math.floor(x / CELL_SIZE), Math.floor(y / CELL_SIZE));
  }

  public getTile(column: number, row: number): TileType {
    return this.isInBounds(column, row) ? this.cells[row][column] : TileType.Empty;
  }

  public isSolidAtPixel(x: number, y: number): boolean {
    return this.isSolid(Math.floor(x / CELL_SIZE), Math.floor(y / CELL_SIZE));
  }

  public isSolid(column: number, row: number): boolean {
    return this.getTile(column, row) === TileType.Brick || this.getTile(column, row) === TileType.Stairs;
  }

  public isWallAtPixel(x: number, y: number): boolean {
    return this.isWall(Math.floor(x / CELL_SIZE), Math.floor(y / CELL_SIZE));
  }

  public isWall(column: number, row: number): boolean {
    return this.getTile(column, row) === TileType.Brick;
  }

  public isDangerousAtPixel(x: number, y: number): boolean {
    return this.isDangerous(Math.floor(x / CELL_SIZE), Math.floor(y / CELL_SIZE));
  }

  public isDangerous(column: number, row: number): boolean {
    return this.getTile(column, row) === TileType.Lava;
  }

  public getTiles(): ITile[] {
    const tiles: ITile[] = [];
    for (let row = 0; row < this.rows; row++) {
      for (let column = 0; column < this.columns; column++) {
        const type = this.cells[row][column];
        if (type !== TileType.Empty) {
          tiles.push({ column, row, type });
        }
      }
    }
    return tiles;
  }

  private isInBounds(column: number, row: number): boolean {
    return column >= 0 && column < this.columns && row >= 0 && row < this.rows;
  }
}
