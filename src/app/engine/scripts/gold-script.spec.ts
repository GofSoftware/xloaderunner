import { GoldScript } from './gold-script';
import { GoldItem } from './gold-item';
import { GameObject } from '../game-object/game-object';
import { ScreenBuffer } from '../screen/screen-buffer';
import { CELL_SIZE, SCREEN_WIDTH } from '../screen/screen.constants';
import { MAX_LIVES } from '../lives';
import { GLYPH_MAP } from '../../data/glyphs';
import { IEngineState } from '../i-engine-state';

describe('GoldScript', () => {
  const hudX = SCREEN_WIDTH - MAX_LIVES * CELL_SIZE;

  function createEngineState(): { engineState: IEngineState; gameObjects: GameObject[] } {
    const gameObjects: GameObject[] = [];
    const engineState = {
      screenBuffer: ScreenBuffer.create(2),
      addGameObject: (gameObject: GameObject) => gameObjects.push(gameObject),
      removeGameObject: (gameObject: GameObject) => {
        const index = gameObjects.indexOf(gameObject);
        if (index >= 0) {
          gameObjects.splice(index, 1);
        }
      },
      getGameObjectsAtPosition: (x: number, y: number) => gameObjects.filter((go) => go.position.x === x && go.position.y === y),
    } as unknown as IEngineState;
    return { engineState, gameObjects };
  }

  function createGoldItem(engineState: IEngineState, gameObjects: GameObject[], position: { x: number; y: number }): GameObject {
    const gold = GameObject.create('Gold', engineState, position, [(go) => GoldItem.create(go)]);
    gameObjects.push(gold);
    return gold;
  }

  function createPlayer(engineState: IEngineState, gameObjects: GameObject[], position: { x: number; y: number }): GameObject {
    const player = GameObject.create('Player', engineState, position, [(go) => GoldScript.create(go, 1)]);
    gameObjects.push(player);
    return player;
  }

  function digitAt(engineState: IEngineState, x: number): number[][] {
    return engineState.screenBuffer.buffers[1].slice(CELL_SIZE, CELL_SIZE * 2).map((row) => row.slice(x, x + CELL_SIZE));
  }

  it('should destroy the gold game object at the player position and increment the counter', () => {
    const { engineState, gameObjects } = createEngineState();
    const gold = createGoldItem(engineState, gameObjects, { x: 16, y: 16 });
    const player = createPlayer(engineState, gameObjects, { x: 16, y: 16 });
    const goldScript = player.getScript(GoldScript)!;

    player.update();

    expect(goldScript.count).toBe(1);
    expect(gameObjects).not.toContain(gold);
  });

  it('should not collect a gold object the player is merely standing near, not on', () => {
    const { engineState, gameObjects } = createEngineState();
    const gold = createGoldItem(engineState, gameObjects, { x: 16, y: 16 });
    const player = createPlayer(engineState, gameObjects, { x: 8, y: 16 });
    const goldScript = player.getScript(GoldScript)!;

    player.update();

    expect(goldScript.count).toBe(0);
    expect(gameObjects).toContain(gold);
  });

  it('should ignore game objects at the same position that are not tagged as gold', () => {
    const { engineState, gameObjects } = createEngineState();
    GameObject.create('Decoration', engineState, { x: 16, y: 16 }, []);
    const player = createPlayer(engineState, gameObjects, { x: 16, y: 16 });
    const goldScript = player.getScript(GoldScript)!;

    player.update();

    expect(goldScript.count).toBe(0);
  });

  it('should not double-count once a gold object has already been destroyed', () => {
    const { engineState, gameObjects } = createEngineState();
    createGoldItem(engineState, gameObjects, { x: 16, y: 16 });
    const player = createPlayer(engineState, gameObjects, { x: 16, y: 16 });
    const goldScript = player.getScript(GoldScript)!;

    player.update();
    player.update();
    player.update();

    expect(goldScript.count).toBe(1);
  });

  it('should count each distinct gold object collected as the player moves across them', () => {
    const { engineState, gameObjects } = createEngineState();
    createGoldItem(engineState, gameObjects, { x: 16, y: 16 });
    createGoldItem(engineState, gameObjects, { x: 24, y: 16 });
    const player = createPlayer(engineState, gameObjects, { x: 16, y: 16 });
    const goldScript = player.getScript(GoldScript)!;

    player.update();
    expect(goldScript.count).toBe(1);

    player.setPosition(24, 16);
    player.update();
    expect(goldScript.count).toBe(2);
  });

  it('should draw only the taken amount in the top right corner, on the given HUD layer', () => {
    const { engineState, gameObjects } = createEngineState();
    createGoldItem(engineState, gameObjects, { x: 16, y: 16 });
    const player = createPlayer(engineState, gameObjects, { x: 16, y: 16 });

    player.update();

    expect(digitAt(engineState, hudX)).toEqual(GLYPH_MAP['1']);
    expect(engineState.screenBuffer.buffers[0].slice(CELL_SIZE, CELL_SIZE * 2).map((row) => row.slice(hudX, hudX + CELL_SIZE))).toEqual(
      GLYPH_MAP['1'].map((row) => row.map(() => 0)),
    );
  });
});
