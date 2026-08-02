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

  private constructor(name: string, engineState: IEngineState, position: Vector2) {
    this.name = name;
    this.engineState = engineState;
    this.positionInstance = position;
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

  public start(): void {
    this.scriptInstances.forEach((script) => script.start());
  }

  public update(): void {
    if (this.enabled) {
      this.scriptInstances.forEach((script) => script.update());
    }
  }

  public destroy(): void {
    this.scriptInstances.forEach((script) => script.destroy());
    this.engineState.removeGameObject(this);
  }
}
