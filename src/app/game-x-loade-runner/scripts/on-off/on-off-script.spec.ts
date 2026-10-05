import { OnOffScript } from './on-off-script';
import { OnOffManager } from './on-off-manager';
import { GameObject } from '../../../engine/game-object/game-object';
import { IEngineState } from '../../../engine/i-engine-state';

describe('OnOffScript', () => {
  let engineState: IEngineState;
  let gameObjectsByName: Map<string, GameObject>;
  let manager: OnOffManager;

  beforeEach(() => {
    gameObjectsByName = new Map<string, GameObject>();
    engineState = {
      getGameObjectByName: (name: string) => gameObjectsByName.get(name),
    } as unknown as IEngineState;

    const managerGameObject = GameObject.create('OnOffManager', engineState, { x: 0, y: 0 }, [(go) => OnOffManager.create(go)]);
    manager = managerGameObject.getScript(OnOffManager)!;
    gameObjectsByName.set('OnOffManager', managerGameObject);
  });

  function createSwitch(initialState: boolean, name: string): GameObject {
    return GameObject.create('Switch', engineState, { x: 0, y: 0 }, [(go) => OnOffScript.create(go, initialState, name)]);
  }

  it('starts with whichever initial state it was constructed with', () => {
    const gameObject = createSwitch(true, 'Switch1');

    expect(gameObject.getScript(OnOffScript)!.on).toBe(true);
  });

  it('lets its on state be toggled after construction', () => {
    const onOffScript = createSwitch(false, 'Switch1').getScript(OnOffScript)!;

    onOffScript.on = true;

    expect(onOffScript.on).toBe(true);
  });

  it('registers itself with the OnOffManager under its name when started', () => {
    const gameObject = createSwitch(false, 'Switch1');

    gameObject.start();

    expect(manager.getOnOff('Switch1')).toBe(gameObject.getScript(OnOffScript)!);
  });

  it('throws if no OnOffManager is tracked by the engine when it starts', () => {
    gameObjectsByName.delete('OnOffManager');
    const gameObject = createSwitch(false, 'Switch1');

    expect(() => gameObject.start()).toThrow();
  });
});
