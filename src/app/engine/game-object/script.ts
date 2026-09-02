import { GameObject } from './game-object';

export class Script {
  protected constructor(protected gameObject: GameObject) {}

  private _enabled: boolean = true;
  public get enabled(): boolean {
    return this._enabled;
  }
  public set enabled(value: boolean) {
    this._enabled = value;
  }

  public start(): void {}
  public update(): void {}
  public destroy(): void {}
}
