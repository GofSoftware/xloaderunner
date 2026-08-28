import { Script } from '../../../engine/game-object/script';
import { GameObject } from '../../../engine/game-object/game-object';
import { MAP_COLUMNS, MAP_ROWS, TileType } from './tile-map-types';
import { MirrorHelper } from '../mirror/mirror-helper';

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
  private readonly objectsAt: GameObject[][][];

  private constructor(gameObject: GameObject) {
    super(gameObject);
    this.cells = Array.from({ length: this.rows }, () => new Array<TileType>(this.columns).fill(TileType.Empty));
    this.objectsAt = Array.from({ length: this.rows }, () => Array.from({ length: this.columns }, () => []));
  }

  public setTile(column: number, row: number, type: TileType): void {
    if (this.isInBounds(column, row)) {
      this.cells[row][column] = type;
    }
  }

  public getTile(column: number, row: number): TileType {
    return this.isInBounds(column, row) ? this.cells[row][column] : TileType.Empty;
  }

  public isSolid(column: number, row: number): boolean {
    return this.getTile(column, row) === TileType.Brick || this.getTile(column, row) === TileType.Stairs;
  }

  public isWall(column: number, row: number): boolean {
    return this.getTile(column, row) === TileType.Brick;
  }

  public isDangerous(column: number, row: number): boolean {
    return this.getTile(column, row) === TileType.Lava;
  }

  public isClimbable(column: number, row: number): boolean {
    return this.getTile(column, row) === TileType.Stairs || this.getTile(column, row) === TileType.Crossbar;
  }

  public isRemovable(column: number, row: number): boolean {
    const type = this.getTile(column, row);
    return type === TileType.Brick || type === TileType.Stairs || type === TileType.Crossbar || MirrorHelper.isMirror(type);
  }

  public getObjectsAt(column: number, row: number): GameObject[] {
    return this.isInBounds(column, row) ? [...this.objectsAt[row][column]] : [];
  }

  public moveObject(gameObject: GameObject, fromColumn: number, fromRow: number, toColumn: number, toRow: number): void {
    this.removeObject(gameObject, fromColumn, fromRow);
    if (this.isInBounds(toColumn, toRow)) {
      this.objectsAt[toRow][toColumn].push(gameObject);
    }
  }

  public removeObject(gameObject: GameObject, column: number, row: number): void {
    if (!this.isInBounds(column, row)) {
      return;
    }
    const cell = this.objectsAt[row][column];
    const index = cell.indexOf(gameObject);
    if (index >= 0) {
      cell.splice(index, 1);
    }
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
