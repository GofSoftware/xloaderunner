import { OnOffScript } from './on-off-script';
import { Script } from '../../../engine/game-object/script';
import { GameObject } from '../../../engine/game-object/game-object';

export class OnOffManager extends Script {
  public static create(gameObject: GameObject): OnOffManager {
    return new OnOffManager(gameObject);
  }

  private onOffScripts: Map<string, OnOffScript> = new Map();

  public registerOnOff(name: string, onOffScript: OnOffScript): void {
    this.onOffScripts.set(name, onOffScript);
  }

  public getOnOff(name: string): OnOffScript | undefined {
    return this.onOffScripts.get(name);
  }
}
