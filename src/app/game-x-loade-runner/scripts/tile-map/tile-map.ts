import { Script } from '../../../engine/game-object/script';
import { GameObject } from '../../../engine/game-object/game-object';
import { MAP_COLUMNS, MAP_ROWS, Tile } from './tile-map-types';
import { MirrorHelper } from '../mirror/mirror-helper';

export interface ITile {
  column: number;
  row: number;
  type: Tile;
}

export class TileMap extends Script {
  public static create(gameObject: GameObject): TileMap {
    return new TileMap(gameObject);
  }

  public readonly columns: number = MAP_COLUMNS;
  public readonly rows: number = MAP_ROWS;

  private readonly cells: Tile[][];
  private readonly objectsAt: GameObject[][][];

  private constructor(gameObject: GameObject) {
    super(gameObject);
    this.cells = Array.from({ length: this.rows }, () => new Array<Tile>(this.columns).fill(Tile.Empty));
    this.objectsAt = Array.from({ length: this.rows }, () => Array.from({ length: this.columns }, () => []));
  }

  public setTile(column: number, row: number, type: Tile): void {
    if (this.isInBounds(column, row)) {
      this.cells[row][column] = type;
    }
  }

  public getTile(column: number, row: number): Tile {
    return this.isInBounds(column, row) ? this.cells[row][column] : Tile.Empty;
  }

  public isSolid(column: number, row: number): boolean {
    return (
      this.getTile(column, row) === Tile.Brick ||
      this.getTile(column, row) === Tile.BrickHard ||
      this.getTile(column, row) === Tile.Stairs ||
      this.getTile(column, row) === Tile.GoldenGates
    );
  }

  public isWall(column: number, row: number): boolean {
    return (
      this.getTile(column, row) === Tile.Brick ||
      this.getTile(column, row) === Tile.BrickHard ||
      this.getTile(column, row) === Tile.GoldenGates
    );
  }

  public isTeleportDestinationBlocker(column: number, row: number): boolean {
    return (
      this.getTile(column, row) === Tile.Brick ||
      this.getTile(column, row) === Tile.Lava ||
      this.getTile(column, row) === Tile.BrickHard
    );
  }

  public isPortableSurface(column: number, row: number): boolean {
    const tile = this.getTile(column, row);
    return tile === Tile.Brick || tile === Tile.BrickHard || tile === Tile.Stairs;
  }

  public isDangerous(column: number, row: number): boolean {
    return this.getTile(column, row) === Tile.Lava;
  }

  public isEmitter(column: number, row: number): boolean {
    const tile = this.getTile(column, row);
    return (
      tile === Tile.EmitterGreenUp ||
      tile === Tile.EmitterGreenDown ||
      tile === Tile.EmitterGreenLeft ||
      tile === Tile.EmitterGreenRight ||
      tile === Tile.EmitterBlueUp ||
      tile === Tile.EmitterBlueDown ||
      tile === Tile.EmitterBlueLeft ||
      tile === Tile.EmitterBlueRight
    );
  }

  public isClimbable(column: number, row: number): boolean {
    return this.getTile(column, row) === Tile.Stairs || this.getTile(column, row) === Tile.Crossbar;
  }

  public isRemovable(column: number, row: number): boolean {
    const type = this.getTile(column, row);
    return type === Tile.Brick || type === Tile.Stairs || type === Tile.Crossbar || MirrorHelper.isMirror(type);
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
        if (type !== Tile.Empty) {
          tiles.push({ column, row, type });
        }
      }
    }
    return tiles;
  }

  public isInBounds(column: number, row: number): boolean {
    return column >= 0 && column < this.columns && row >= 0 && row < this.rows;
  }
}
