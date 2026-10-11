import { XLodeRunnerGame } from './x-lode-runner-game';
import { LivesScript } from './scripts/lives-script';
import { GameObject } from '../engine/game-object/game-object';
import { Keyboard } from '../engine/keyboard/keyboard';
import { ScreenBuffer } from '../engine/screen/screen-buffer';
import { LAYER_COUNT } from '../engine/screen/screen.constants';
import { IEngineState } from '../engine/i-engine-state';
import { MAX_LIVES } from './x-lode-runner-constants';

describe('XLodeRunnerGame', () => {
  let engineState: IEngineState;
  let keyboard: Keyboard;

  // Mirrors Engine's own gameObjects/gameObjectsByName/addGameObject/removeGameObject/reset bookkeeping
  // closely enough that the real XLodeRunnerLevel1/XLodeRunnerLevel2 - golden gates, beam switches,
  // emitters and all - initialize exactly as they do against the real Engine, without pulling in
  // Engine's own setTimeout-driven render loop, which would make these tests depend on real timers.
  function createEngineState(): IEngineState {
    const gameObjects: GameObject[] = [];
    const gameObjectsByName = new Map<string, GameObject[]>();

    const setNamed = (gameObject: GameObject, newName?: string): void => {
      const existing = gameObjectsByName.get(gameObject.name);
      if (existing) {
        const index = existing.indexOf(gameObject);
        if (index >= 0) {
          existing.splice(index, 1);
        }
        if (existing.length === 0) {
          gameObjectsByName.delete(gameObject.name);
        }
      }
      if (newName != null) {
        gameObject.name = newName;
      }
      const named = gameObjectsByName.get(gameObject.name);
      if (named) {
        named.push(gameObject);
      } else {
        gameObjectsByName.set(gameObject.name, [gameObject]);
      }
    };

    const removeGameObject = (gameObject: GameObject): void => {
      const index = gameObjects.indexOf(gameObject);
      if (index >= 0) {
        gameObjects.splice(index, 1);
      }
      const named = gameObjectsByName.get(gameObject.name);
      if (named) {
        const namedIndex = named.indexOf(gameObject);
        if (namedIndex >= 0) {
          named.splice(namedIndex, 1);
        }
        if (named.length === 0) {
          gameObjectsByName.delete(gameObject.name);
        }
      }
      if (!gameObject.isDestroyed) {
        gameObject.destroy();
      }
    };

    return {
      screenBuffer: ScreenBuffer.create(LAYER_COUNT),
      keyboard,
      soundPlayer: {} as IEngineState['soundPlayer'],
      musicPlayer: { register: () => {}, play: () => {} } as unknown as IEngineState['musicPlayer'],
      deltaTime: 0,
      fps: 0,
      timeFromStart: 0,
      startedAt: 0,
      game: {} as IEngineState['game'],
      addGameObject: (gameObject: GameObject) => {
        gameObjects.push(gameObject);
        setNamed(gameObject);
        gameObject.start();
      },
      removeGameObject,
      getGameObjectByName: (name: string) => gameObjectsByName.get(name)?.[0],
      getGameObjectsByName: (name: string) => gameObjectsByName.get(name) ?? [],
      renameGameObject: (gameObject: GameObject, name: string) => setNamed(gameObject, name),
      reset: () => {
        [...gameObjects].forEach((gameObject) => removeGameObject(gameObject));
        gameObjectsByName.clear();
        keyboard.reset();
      },
      registerAfterUpdate: (fn: () => void) => fn(),
    };
  }

  // LivesScript defers loseLife()/nextLevel() through registerAfterUpdate, whose callback here fires
  // synchronously but doesn't await the async startLevel() chain it kicks off - give that promise
  // chain a real turn of the event loop to finish before asserting on the result.
  async function flush(): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }

  // Simulates StartMenuScript's "press any key to continue" on whichever screen ('Start Menu' or
  // 'Game Over') currently owns the 'Any Key' game object.
  function pressAnyKey(): void {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    engineState.getGameObjectByName('Any Key')!.update();
    keyboard.next();
  }

  function currentLives(): LivesScript {
    return engineState.getGameObjectByName('Lives')!.getScript(LivesScript)!;
  }

  beforeEach(() => {
    keyboard = Keyboard.create();
    keyboard.attach();
    engineState = createEngineState();
  });

  afterEach(() => {
    keyboard.detach();
  });

  it('starts on a non-playable Start Menu screen, without a Lives game object', async () => {
    const game = XLodeRunnerGame.create();

    await game.start(engineState);

    expect(engineState.getGameObjectByName('Any Key')).toBeDefined();
    expect(engineState.getGameObjectByName('Lives')).toBeUndefined();
  });

  it('begins the first level with a full set of lives once any key is pressed', async () => {
    const game = XLodeRunnerGame.create();
    await game.start(engineState);

    pressAnyKey();
    await flush();

    expect(currentLives().count).toBe(MAX_LIVES);
    expect(engineState.getGameObjectsByName('Enemy')).toHaveLength(2); // XLodeRunnerLevel1 has two EnS tiles.
  });

  it('restarts the same level and decrements the life count when a life is lost with lives remaining', async () => {
    const game = XLodeRunnerGame.create();
    await game.start(engineState);
    pressAnyKey();
    await flush();

    currentLives().loseLife();
    await flush();

    expect(currentLives().count).toBe(MAX_LIVES - 1);
    expect(engineState.getGameObjectsByName('Enemy')).toHaveLength(2); // still XLodeRunnerLevel1.
  });

  it('ends the game once every life is lost', async () => {
    const game = XLodeRunnerGame.create();
    await game.start(engineState);
    pressAnyKey();
    await flush();

    for (let i = 0; i < MAX_LIVES; i++) {
      currentLives().loseLife();
      await flush();
    }

    expect(engineState.getGameObjectByName('Lives')).toBeUndefined();
    expect(engineState.getGameObjectByName('Map')).toBeUndefined();
    expect(engineState.getGameObjectByName('Any Key')).toBeDefined();
  });

  it('advances to the next level once the player finishes one, carrying the same lives over', async () => {
    const game = XLodeRunnerGame.create();
    await game.start(engineState);
    pressAnyKey();
    await flush();
    currentLives().loseLife(); // drop below MAX_LIVES first, to prove the count carries over rather than resetting
    await flush();
    const livesBeforeFinish = currentLives().count;

    currentLives().nextLevel();
    await flush();

    expect(currentLives().count).toBe(livesBeforeFinish);
    expect(engineState.getGameObjectsByName('Enemy')).toHaveLength(1); // XLodeRunnerLevel2 has one EnS tile.
  });

  it('ends the game once the player finishes the last level', async () => {
    const game = XLodeRunnerGame.create();
    await game.start(engineState);
    pressAnyKey();
    await flush();

    currentLives().nextLevel(); // level 1 -> level 2
    await flush();
    currentLives().nextLevel(); // level 2 was the last level -> game over
    await flush();

    expect(engineState.getGameObjectByName('Lives')).toBeUndefined();
    expect(engineState.getGameObjectByName('Map')).toBeUndefined();
    expect(engineState.getGameObjectByName('Any Key')).toBeDefined();
  });

  it('returns to the Start Menu with a full set of lives once the Game Over screen is continued past', async () => {
    const game = XLodeRunnerGame.create();
    await game.start(engineState);
    pressAnyKey();
    await flush();
    for (let i = 0; i < MAX_LIVES; i++) {
      currentLives().loseLife();
      await flush();
    }

    pressAnyKey(); // continue past Game Over, back to the Start Menu
    await flush();
    expect(engineState.getGameObjectByName('Lives')).toBeUndefined();

    pressAnyKey(); // continue past the Start Menu, back into level 1
    await flush();

    expect(currentLives().count).toBe(MAX_LIVES);
    expect(engineState.getGameObjectsByName('Enemy')).toHaveLength(2);
  });
});
