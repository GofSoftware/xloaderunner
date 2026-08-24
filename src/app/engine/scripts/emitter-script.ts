import { Script } from '../game-object/script';
import { GameObject } from '../game-object/game-object';
import { ObjectPosition } from './object-position';
import { Direction } from './state-script';
import { TileType } from './tile-map';
import { EmitterColor } from './emitter-color';
import { EmitterManager } from './emitter-manager';

export const EMITTER_INFO_BY_TILE_TYPE: Partial<Record<TileType, { color: EmitterColor; direction: Direction }>> = {
  [TileType.EmitterRedLeft]: { color: EmitterColor.Green, direction: Direction.Left },
  [TileType.EmitterRedRight]: { color: EmitterColor.Green, direction: Direction.Right },
  [TileType.EmitterRedUp]: { color: EmitterColor.Green, direction: Direction.Up },
  [TileType.EmitterRedDown]: { color: EmitterColor.Green, direction: Direction.Down },
  [TileType.EmitterBlueLeft]: { color: EmitterColor.Blue, direction: Direction.Left },
  [TileType.EmitterBlueRight]: { color: EmitterColor.Blue, direction: Direction.Right },
  [TileType.EmitterBlueUp]: { color: EmitterColor.Blue, direction: Direction.Up },
  [TileType.EmitterBlueDown]: { color: EmitterColor.Blue, direction: Direction.Down },
};

/**
 * Marks a tile GameObject as a fixed beam emitter of a given color/direction. Registers itself with
 * the shared EmitterManager (looked up by name, the same way scripts reach TileMap via 'Map') on
 * start, and unregisters on destroy - the manager, not this script, does the actual beam
 * calculation/drawing, since that has to consider every emitter at once (see EmitterManager).
 */
export class EmitterScript extends Script {
  public static create(gameObject: GameObject, color: EmitterColor, direction: Direction): EmitterScript {
    return new EmitterScript(gameObject, color, direction);
  }

  public readonly color: EmitterColor;
  public readonly direction: Direction;

  private constructor(gameObject: GameObject, color: EmitterColor, direction: Direction) {
    super(gameObject);
    this.color = color;
    this.direction = direction;
  }

  private get objectPosition(): ObjectPosition {
    return this.gameObject.getScript(ObjectPosition)!;
  }

  public get column(): number {
    return this.objectPosition.column;
  }

  public get row(): number {
    return this.objectPosition.row;
  }

  private get manager(): EmitterManager | undefined {
    return this.gameObject.engineState.getGameObjectByName('Emitters')?.getScript(EmitterManager);
  }

  public override start(): void {
    this.manager?.register(this);
  }

  public override destroy(): void {
    this.manager?.unregister(this);
  }
}
