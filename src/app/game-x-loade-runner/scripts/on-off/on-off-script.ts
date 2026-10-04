import { Script } from '../../../engine/game-object/script';
import { GameObject } from '../../../engine/game-object/game-object';
import { OnOffManager } from './on-off-manager';

export class OnOffScript extends Script {
  public static create(gameObject: GameObject, initialState: boolean, name: string) {
    return new OnOffScript(gameObject, initialState, name);
  }

  private readonly name: string;
  private _on: boolean = false;
  public get on(): boolean {
    return this._on;
  }
  public set on(value: boolean) {
    this._on = value;
  }

  protected constructor(gameObject: GameObject, initialState: boolean, name: string) {
    super(gameObject);
    this._on = initialState;
    this.name = name;
  }

  public override start(): void {
    const manager = this.gameObject.engineState.getGameObjectByName('OnOffManager')?.getScript(OnOffManager);
    if (manager) {
      manager.registerOnOff(this.name, this);
    } else {
      throw new Error('OnOffManager not found in the engine state.');
    }
  }
}
