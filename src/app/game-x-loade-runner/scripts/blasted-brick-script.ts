import { Script } from '../../engine/game-object/script';
import { GameObject } from '../../engine/game-object/game-object';
import { ObjectPosition } from './object-position';
import { Direction, StateScript } from './state-script';
import { TileMap } from './tile-map/tile-map';
import { createTileGameObject } from './tile-bitmaps';
import { TileType } from './tile-map/tile-map-types';

const BLAST_KEY = 'Space';
const RESTORE_DELAY_MS = 5000;

const OFFSET_BY_DIRECTION: Record<Direction, { column: number; row: number }> = {
  [Direction.Left]: { column: -1, row: 0 },
  [Direction.Right]: { column: 1, row: 0 },
  [Direction.Up]: { column: 0, row: -1 },
  [Direction.Down]: { column: 0, row: 1 },
};

/**
 * Lets the player blast open the ground just ahead of them: pressing Space checks the cell one step in
 * the player's current facing direction (StateScript.direction, defaulting to Right) and one row below
 * that - the ground they'd land on if they stepped that way. If it's a Brick, it's replaced with a
 * BlastedBrick for RESTORE_DELAY_MS, then reverts back to a regular Brick.
 */
export class BlastedBrickScript extends Script {
  public static create(gameObject: GameObject): BlastedBrickScript {
    return new BlastedBrickScript(gameObject);
  }

  private constructor(gameObject: GameObject) {
    super(gameObject);
  }

  private get tileMap(): TileMap {
    return this.gameObject.engineState.getGameObjectByName('Map')!.getScript(TileMap)!;
  }

  private get objectPosition(): ObjectPosition {
    return this.gameObject.getScript(ObjectPosition)!;
  }

  private get facingDirection(): Direction {
    return this.gameObject.getScript(StateScript)?.direction ?? Direction.Right;
  }

  public override update(): void {
    const { keyboard } = this.gameObject.engineState;
    if (!keyboard.wasPressedThisFrame(BLAST_KEY)) {
      return;
    }

    const { column, row } = this.objectPosition;
    const offset = OFFSET_BY_DIRECTION[this.facingDirection];
    const targetColumn = column + offset.column;
    const targetRow = row + offset.row + 1;

    if (this.tileMap.getTile(targetColumn, targetRow) !== TileType.Brick) {
      return;
    }

    this.blast(targetColumn, targetRow);
  }

  private blast(column: number, row: number): void {
    const { engineState } = this.gameObject;

    const brickGameObject = engineState.getGameObjectByName(`Tile-${column}-${row}`);
    if (brickGameObject) {
      engineState.removeGameObject(brickGameObject);
    }
    this.tileMap.setTile(column, row, TileType.BlastedBrick);

    setTimeout(() => this.restore(column, row), RESTORE_DELAY_MS);
  }

  private restore(column: number, row: number): void {
    this.tileMap.setTile(column, row, TileType.Brick);
    const brickGameObject = createTileGameObject(this.gameObject.engineState, column, row, TileType.Brick);
    if (brickGameObject) {
      this.gameObject.engineState.addGameObject(brickGameObject);
    }
  }
}
