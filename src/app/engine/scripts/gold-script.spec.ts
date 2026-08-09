import { GoldScript } from './gold-script';
import { GoldItem } from './gold-item';
import { TileMap } from './tile-map';
import { ObjectPosition } from './object-position';
import { GameObject } from '../game-object/game-object';
import { ScreenBuffer } from '../screen/screen-buffer';
import { CELL_SIZE, SCREEN_WIDTH } from '../screen/screen.constants';
import { MAX_LIVES } from './lives-script';
import { GLYPH_MAP } from '../../data/glyphs';
import { OBJECT_GOLD_HUD } from '../../data/sprites';
import { IEngineState } from '../i-engine-state';

describe('GoldScript', () => {
  const startX = SCREEN_WIDTH - MAX_LIVES * CELL_SIZE;

  let engineState: IEngineState;
  let tileMap: TileMap;

  beforeEach(() => {
    const gameObjectsByName = new Map<string, GameObject>();
    engineState = {
      screenBuffer: ScreenBuffer.create(2),
      addGameObject: () => {},
      removeGameObject: () => {},
      getGameObjectByName: (name: string) => gameObjectsByName.get(name),
    } as unknown as IEngineState;

    const mapGameObject = GameObject.create('Map', engineState, { x: 0, y: 0 }, [(go) => TileMap.create(go)]);
    tileMap = mapGameObject.getScript(TileMap)!;
    gameObjectsByName.set('Map', mapGameObject);
  });

  function createGoldItem(column: number, row: number): GameObject {
    const gold = GameObject.create('Gold', engineState, { x: column * CELL_SIZE, y: row * CELL_SIZE }, [
      (go) => ObjectPosition.create(go, column, row),
      (go) => GoldItem.create(go),
    ]);
    gold.start();
    return gold;
  }

  function createPlayer(column: number, row: number): GameObject {
    const player = GameObject.create('Player', engineState, { x: column * CELL_SIZE, y: row * CELL_SIZE }, [
      (go) => ObjectPosition.create(go, column, row),
      (go) => GoldScript.create(go, 1),
    ]);
    player.start();
    return player;
  }

  function regionAt(layer: number, x: number): number[][] {
    return engineState.screenBuffer.buffers[layer].slice(CELL_SIZE, CELL_SIZE * 2).map((row) => row.slice(x, x + CELL_SIZE));
  }

  it('should destroy the gold game object at the player position and increment the counter', () => {
    const gold = createGoldItem(2, 2);
    const player = createPlayer(2, 2);
    const goldScript = player.getScript(GoldScript)!;

    player.update();

    expect(goldScript.count).toBe(1);
    expect(tileMap.getObjectsAt(2, 2)).not.toContain(gold);
  });

  it('should not collect a gold object the player is merely standing near, not on', () => {
    const gold = createGoldItem(2, 2);
    const player = createPlayer(1, 2);
    const goldScript = player.getScript(GoldScript)!;

    player.update();

    expect(goldScript.count).toBe(0);
    expect(tileMap.getObjectsAt(2, 2)).toContain(gold);
  });

  it('should ignore game objects at the same position that are not tagged as gold', () => {
    const decoration = GameObject.create('Decoration', engineState, { x: CELL_SIZE * 2, y: CELL_SIZE * 2 }, [
      (go) => ObjectPosition.create(go, 2, 2),
    ]);
    decoration.start();
    const player = createPlayer(2, 2);
    const goldScript = player.getScript(GoldScript)!;

    player.update();

    expect(goldScript.count).toBe(0);
  });

  it('should not double-count once a gold object has already been destroyed', () => {
    createGoldItem(2, 2);
    const player = createPlayer(2, 2);
    const goldScript = player.getScript(GoldScript)!;

    player.update();
    player.update();
    player.update();

    expect(goldScript.count).toBe(1);
  });

  it('should count each distinct gold object collected as the player moves across them', () => {
    createGoldItem(2, 2);
    createGoldItem(3, 2);
    const player = createPlayer(2, 2);
    const goldScript = player.getScript(GoldScript)!;
    const objectPosition = player.getScript(ObjectPosition)!;

    player.update();
    expect(goldScript.count).toBe(1);

    objectPosition.teleportTo(3, 2);
    player.update();
    expect(goldScript.count).toBe(2);
  });

  it('should draw the gold icon and the taken amount in the top right corner, on the given HUD layer', () => {
    createGoldItem(2, 2);
    const player = createPlayer(2, 2);

    player.update();

    expect(regionAt(1, startX)).toEqual(OBJECT_GOLD_HUD);
    expect(regionAt(1, startX + CELL_SIZE)).toEqual(GLYPH_MAP['1']);
    expect(regionAt(0, startX)).toEqual(GLYPH_MAP['1'].map((row) => row.map(() => 0)));
  });
});
