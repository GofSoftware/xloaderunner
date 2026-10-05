import { GoldenGateLock } from './golden-gate-lock';
import { OnOffManager } from '../on-off/on-off-manager';
import { OnOffScript } from '../on-off/on-off-script';
import { TileMap } from '../tile-map/tile-map';
import { Tile } from '../tile-map/tile-map-types';
import { GameObject } from '../../../engine/game-object/game-object';
import { CELL_SIZE } from '../../../engine/screen/screen.constants';
import { IEngineState } from '../../../engine/i-engine-state';

describe('GoldenGateLock', () => {
  let engineState: IEngineState;
  let gameObjectsByName: Map<string, GameObject>;
  let tileMap: TileMap;
  let onOffManager: OnOffManager;

  const LINKED_NAME = 'BEAM_SWITCH_1_NAME';

  beforeEach(() => {
    gameObjectsByName = new Map<string, GameObject>();
    engineState = {
      getGameObjectByName: (name: string) => gameObjectsByName.get(name),
    } as unknown as IEngineState;

    const mapGameObject = GameObject.create('Map', engineState, { x: 0, y: 0 }, [(go) => TileMap.create(go)]);
    tileMap = mapGameObject.getScript(TileMap)!;
    gameObjectsByName.set('Map', mapGameObject);

    const onOffManagerGameObject = GameObject.create('OnOffManager', engineState, { x: 0, y: 0 }, [(go) => OnOffManager.create(go)]);
    onOffManager = onOffManagerGameObject.getScript(OnOffManager)!;
    gameObjectsByName.set('OnOffManager', onOffManagerGameObject);
  });

  function createSwitch(initialState: boolean, name: string): OnOffScript {
    const gameObject = GameObject.create('Switch', engineState, { x: 0, y: 0 }, [(go) => OnOffScript.create(go, initialState, name)]);
    gameObject.start();
    return gameObject.getScript(OnOffScript)!;
  }

  function createGate(column: number, row: number, linkedOnOffScriptName: string): GameObject {
    tileMap.setTile(column, row, Tile.GoldenGates);
    return GameObject.create('Gate', engineState, { x: column * CELL_SIZE, y: row * CELL_SIZE }, [
      (go) => GoldenGateLock.create(go, { linkedOnOffScriptName }),
    ]);
  }

  it('opens the gate (clears the tile to Empty) once its linked switch is on', () => {
    createSwitch(true, LINKED_NAME);
    const gate = createGate(3, 4, LINKED_NAME);

    gate.update();

    expect(tileMap.getTile(3, 4)).toBe(Tile.Empty);
  });

  it('keeps the gate shut while its linked switch is off', () => {
    createSwitch(false, LINKED_NAME);
    const gate = createGate(3, 4, LINKED_NAME);

    gate.update();

    expect(tileMap.getTile(3, 4)).toBe(Tile.GoldenGates);
  });

  it('closes the gate again once the linked switch turns back off', () => {
    const onOffScript = createSwitch(true, LINKED_NAME);
    const gate = createGate(3, 4, LINKED_NAME);

    gate.update();
    expect(tileMap.getTile(3, 4)).toBe(Tile.Empty);

    onOffScript.on = false;
    gate.update();

    expect(tileMap.getTile(3, 4)).toBe(Tile.GoldenGates);
  });

  it('lets two separate gates share the same linked switch name', () => {
    createSwitch(true, LINKED_NAME);
    const gateA = createGate(3, 4, LINKED_NAME);
    const gateB = createGate(10, 2, LINKED_NAME);

    gateA.update();
    gateB.update();

    expect(tileMap.getTile(3, 4)).toBe(Tile.Empty);
    expect(tileMap.getTile(10, 2)).toBe(Tile.Empty);
  });

  it('throws if no OnOffScript is registered under the linked name', () => {
    const gate = createGate(3, 4, 'MissingSwitch');

    expect(() => gate.update()).toThrow();
  });

  it('throws if no OnOffManager is tracked by the engine', () => {
    gameObjectsByName.delete('OnOffManager');
    const gate = createGate(3, 4, LINKED_NAME);

    expect(() => gate.update()).toThrow();
  });
});
