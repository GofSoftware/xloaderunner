import { IGameObject } from './i-game-object';
import { Script } from './script';
import { Vector2 } from '../math/vector-2';
import { IEngineState } from '../i-engine-state';

export class GameObject implements IGameObject {
  public static create(
    name: string,
    engineState: IEngineState,
    position: Vector2,
    scriptFactories: ((gameObject: GameObject) => Script)[],
  ): GameObject {
    const gameObject = new GameObject(name, engineState, position);
    gameObject.scriptInstances = scriptFactories.map((scriptFactory) => scriptFactory(gameObject));
    return gameObject;
  }

  public readonly engineState: IEngineState;

  private readonly positionInstance: Vector2 = { x: 0, y: 0 };
  public readonly name: string;
  private scriptInstances: Script[] = [];

  public enabled: boolean = true;
  private started: boolean = false;
  private destroyed: boolean = false;

  private constructor(name: string, engineState: IEngineState, position: Vector2) {
    this.name = name;
    this.engineState = engineState;
    // Clone rather than alias - callers may hold onto the position object they
    // passed in (e.g. a spawn point reused after death), and setPosition()
    // mutates positionInstance in place.
    this.positionInstance = { x: position.x, y: position.y };
  }

  public get position(): Readonly<Vector2> {
    return this.positionInstance;
  }

  public setPosition(x: number, y: number): void {
    this.positionInstance.x = x;
    this.positionInstance.y = y;
  }

  public getScript<T extends Script>(scriptType: Function & { prototype: T }): T | undefined {
    return this.scriptInstances.find((script): script is T => script instanceof scriptType);
  }

  public get isStarted(): boolean {
    return this.started;
  }

  // Idempotent - Engine.addGameObject() calls this on every add, so callers never have to
  // remember to start() a game object themselves after handing it to the engine.
  public start(): void {
    if (this.started) {
      return;
    }
    this.started = true;
    this.scriptInstances.forEach((script) => script.start());
  }

  public update(): void {
    if (this.enabled) {
      this.scriptInstances.forEach((script) => script.update());
    }
  }

  public get isDestroyed(): boolean {
    return this.destroyed;
  }

  // Idempotent - Engine.removeGameObject() calls this on every remove, so callers never have to
  // remember to destroy() a game object themselves before handing it to the engine to untrack.
  public destroy(): void {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    this.scriptInstances.forEach((script) => script.destroy());
  }
}
