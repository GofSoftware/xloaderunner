import { OnOffManager } from './on-off-manager';
import { OnOffScript } from './on-off-script';
import { GameObject } from '../../../engine/game-object/game-object';
import { IEngineState } from '../../../engine/i-engine-state';

describe('OnOffManager', () => {
  let manager: OnOffManager;

  beforeEach(() => {
    const gameObject = GameObject.create('OnOffManager', {} as IEngineState, { x: 0, y: 0 }, [(go) => OnOffManager.create(go)]);
    manager = gameObject.getScript(OnOffManager)!;
  });

  it('returns undefined for a name nothing has registered', () => {
    expect(manager.getOnOff('Switch1')).toBeUndefined();
  });

  it('returns the OnOffScript registered under a given name', () => {
    const switchObject = GameObject.create('Switch', {} as IEngineState, { x: 0, y: 0 }, [
      (go) => OnOffScript.create(go, false, 'Switch1'),
    ]);
    const onOffScript = switchObject.getScript(OnOffScript)!;

    manager.registerOnOff('Switch1', onOffScript);

    expect(manager.getOnOff('Switch1')).toBe(onOffScript);
  });

  it('lets a later registration under the same name replace the earlier one', () => {
    const first = GameObject.create('Switch1', {} as IEngineState, { x: 0, y: 0 }, [(go) => OnOffScript.create(go, false, 'Shared')]);
    const second = GameObject.create('Switch2', {} as IEngineState, { x: 0, y: 0 }, [(go) => OnOffScript.create(go, true, 'Shared')]);

    manager.registerOnOff('Shared', first.getScript(OnOffScript)!);
    manager.registerOnOff('Shared', second.getScript(OnOffScript)!);

    expect(manager.getOnOff('Shared')).toBe(second.getScript(OnOffScript)!);
  });
});
