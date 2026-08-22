import { Script } from '../game-object/script';
import { GameObject } from '../game-object/game-object';
import { StateScript } from './state-script';
import { ObjectPosition } from './object-position';
import { TileMap, TileType } from './tile-map';

interface ICell {
  column: number;
  row: number;
}

/**
 * Chases the Player by pathfinding to its current cell every frame and forcing the direction of
 * the first step onto this GameObject's own StateScript. The path only ever crosses cells the
 * Player itself could reach under StateScript's movement rules: a horizontal step requires the
 * current cell to be grounded or on a climbable tile, an upward step requires standing on stairs,
 * and a downward step is always available (falling, or climbing down) as long as the target cell
 * isn't a wall or lava. Pathfinding treats a temporarily-blasted brick as solid ground - unlike
 * StateScript, which correctly falls through it - so the enemy naively walks out over a dug hole
 * instead of routing around it, same as it would over an intact floor. StateScript then drops it one
 * cell into the hole and pins it there (Trapped) until the brick reforms.
 */
export class EnemyScript extends Script {
  public static create(gameObject: GameObject): EnemyScript {
    return new EnemyScript(gameObject);
  }

  private constructor(gameObject: GameObject) {
    super(gameObject);
  }

  private get stateScript(): StateScript {
    return this.gameObject.getScript(StateScript)!;
  }

  private get objectPosition(): ObjectPosition {
    return this.gameObject.getScript(ObjectPosition)!;
  }

  private get tileMap(): TileMap {
    return this.gameObject.engineState.getGameObjectByName('Map')!.getScript(TileMap)!;
  }

  private get player(): GameObject | undefined {
    return this.gameObject.engineState.getGameObjectByName('Player');
  }

  public override update(): void {
    const playerPosition = this.player?.getScript(ObjectPosition);
    const from: ICell = { column: this.objectPosition.column, row: this.objectPosition.row };
    const next = playerPosition ? this.findNextStep(from, { column: playerPosition.column, row: playerPosition.row }) : undefined;

    this.stateScript.forceLeft(next !== undefined && next.column < from.column);
    this.stateScript.forceRight(next !== undefined && next.column > from.column);
    this.stateScript.forceUp(next !== undefined && next.row < from.row);
    this.stateScript.forceDown(next !== undefined && next.row > from.row);
  }

  private findNextStep(from: ICell, to: ICell): ICell | undefined {
    if (from.column === to.column && from.row === to.row) {
      return undefined;
    }

    const cameFrom = new Map<string, ICell>();
    const visited = new Set<string>([EnemyScript.key(from)]);
    const queue: ICell[] = [from];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.column === to.column && current.row === to.row) {
        return EnemyScript.firstStep(from, to, cameFrom);
      }

      for (const neighbor of this.neighbors(current)) {
        const neighborKey = EnemyScript.key(neighbor);
        if (visited.has(neighborKey)) {
          continue;
        }
        visited.add(neighborKey);
        cameFrom.set(neighborKey, current);
        queue.push(neighbor);
      }
    }

    return undefined;
  }

  private static firstStep(from: ICell, to: ICell, cameFrom: Map<string, ICell>): ICell {
    let step = to;
    while (true) {
      const previous = cameFrom.get(EnemyScript.key(step))!;
      if (previous.column === from.column && previous.row === from.row) {
        return step;
      }
      step = previous;
    }
  }

  private neighbors(cell: ICell): ICell[] {
    const { column, row } = cell;
    const result: ICell[] = [];

    if (this.isSupported(column, row)) {
      if (this.isPassable(column - 1, row)) {
        result.push({ column: column - 1, row });
      }
      if (this.isPassable(column + 1, row)) {
        result.push({ column: column + 1, row });
      }
    }
    if (this.tileMap.getTile(column, row) === TileType.Stairs && this.isPassable(column, row - 1)) {
      result.push({ column, row: row - 1 });
    }
    if (this.isPassable(column, row + 1)) {
      result.push({ column, row: row + 1 });
    }

    return result;
  }

  private isSupported(column: number, row: number): boolean {
    return (
      this.tileMap.isSolid(column, row + 1) ||
      this.tileMap.getTile(column, row + 1) === TileType.BlastedBrick ||
      this.tileMap.isClimbable(column, row)
    );
  }

  private isPassable(column: number, row: number): boolean {
    return this.isInBounds(column, row) && !this.tileMap.isWall(column, row) && !this.tileMap.isDangerous(column, row);
  }

  private isInBounds(column: number, row: number): boolean {
    return column >= 0 && column < this.tileMap.columns && row >= 0 && row < this.tileMap.rows;
  }

  private static key(cell: ICell): string {
    return `${cell.column},${cell.row}`;
  }
}
