import { Script } from '../../engine/game-object/script';
import { GameObject } from '../../engine/game-object/game-object';

export class OnOffScript extends Script {
  public static create(gameObject: GameObject, initialState: boolean) {
    return new OnOffScript(gameObject, initialState);
  }

  private _on: boolean = false;
  public get on(): boolean {
    return this._on;
  }
  public set on(value: boolean) {
    this._on = value;
  }

  protected constructor(gameObject: GameObject, initialState: boolean) {
    super(gameObject);
    this._on = initialState;
  }
}
