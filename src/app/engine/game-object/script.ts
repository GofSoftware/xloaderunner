import { GameObject } from './game-object';

export class Script {
  protected constructor(protected gameObject: GameObject) {}

  public start(): void {}
  public update(): void {}
  public destroy(): void {}
}
