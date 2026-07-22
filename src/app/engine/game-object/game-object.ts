import { IGameObject } from './i-game-object';
import { Script } from './script';
import { Vector2 } from '../math/vector-2';
import { IEngineState } from '../i-engine-state';

export class GameObject implements IGameObject {
  public static create(
    engineState: IEngineState,
    position: Vector2,
    scriptFactories: ((gameObject: GameObject) => Script)[],
  ): GameObject {
    const gameObject = new GameObject(engineState, position);
    gameObject.scriptInstances = scriptFactories.map((scriptFactory) => scriptFactory(gameObject));
    return gameObject;
  }

  public readonly engineState: IEngineState;
  private readonly positionInstance: Vector2 = { x: 0, y: 0 };
  private scriptInstances: Script[] = [];

  private constructor(engineState: IEngineState, position: Vector2) {
    this.engineState = engineState;
    this.positionInstance = position;
  }

  public get position(): Readonly<Vector2> {
    return this.positionInstance;
  }

  public start(): void {
    this.scriptInstances.forEach((script) => script.start());
  }

  public update(): void {
    this.scriptInstances.forEach((script) => script.update());
  }

  public destroy(): void {
    this.scriptInstances.forEach((script) => script.destroy());
  }
}
