import { Script } from '../game-object/script';
import { GameObject } from '../game-object/game-object';
import { TileMap } from './tile-map';
import { MapHelper } from './map.helper';

/**
 * The only script allowed to reposition a GameObject that TileMap should track. The map's per-cell
 * registry is updated instantly on teleportTo()/moveTo(), while gameObject.position (used for rendering)
 * only catches up smoothly over time during moveTo() - so collision/pickup queries against the new cell
 * are correct right away even while the sprite is still sliding across the pixel gap.
 */
export class ObjectPosition extends Script {
  public static create(gameObject: GameObject, column: number, row: number): ObjectPosition {
    return new ObjectPosition(gameObject, column, row);
  }

  private currentColumn: number;
  private currentRow: number;
  private transition: { targetColumn: number; targetRow: number; speed: number } | undefined;

  private constructor(gameObject: GameObject, column: number, row: number) {
    super(gameObject);
    this.currentColumn = column;
    this.currentRow = row;
  }

  // May legitimately be undefined during Engine.stop() - the 'Map' GameObject can already have
  // been destroyed (and dropped from the by-name registry) by the time a later object in the same
  // teardown pass gets destroyed and tries to deregister itself here.
  private get tileMap(): TileMap | undefined {
    return this.gameObject.engineState.getGameObjectByName('Map')?.getScript(TileMap);
  }

  public get column(): number {
    return this.currentColumn;
  }

  public get row(): number {
    return this.currentRow;
  }

  public get isMoving(): boolean {
    return this.transition !== undefined;
  }

  public override start(): void {
    this.teleportTo(this.currentColumn, this.currentRow);
  }

  public teleportTo(column: number, row: number): void {
    this.relocate(column, row);
    this.transition = undefined;
    const { x, y } = MapHelper.mapToScreen(column, row);
    this.gameObject.setPosition(x, y);
  }

  public moveTo(column: number, row: number, speed: number): void {
    this.relocate(column, row);
    this.transition = { targetColumn: column, targetRow: row, speed };
  }

  public override update(): void {
    if (!this.transition) {
      return;
    }
    const { deltaTime } = this.gameObject.engineState;
    const { targetColumn, targetRow, speed } = this.transition;
    const target = MapHelper.mapToScreen(targetColumn, targetRow);
    const distance = speed * deltaTime;
    const { x, y } = this.gameObject.position;
    const nextX = ObjectPosition.moveToward(x, target.x, distance);
    const nextY = ObjectPosition.moveToward(y, target.y, distance);
    this.gameObject.setPosition(nextX, nextY);

    if (nextX === target.x && nextY === target.y) {
      this.transition = undefined;
    }
  }

  public override destroy(): void {
    this.tileMap?.removeObject(this.gameObject, this.currentColumn, this.currentRow);
  }

  private relocate(column: number, row: number): void {
    this.tileMap?.moveObject(this.gameObject, this.currentColumn, this.currentRow, column, row);
    this.currentColumn = column;
    this.currentRow = row;
  }

  private static moveToward(current: number, target: number, maxDelta: number): number {
    if (current < target) {
      return Math.min(current + maxDelta, target);
    }
    if (current > target) {
      return Math.max(current - maxDelta, target);
    }
    return target;
  }
}
