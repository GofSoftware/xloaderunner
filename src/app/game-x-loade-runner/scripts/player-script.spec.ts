import { vi } from 'vitest';
import { PlayerScript } from './player-script';
import { StateScript } from './state-script';
import { LivesScript } from './lives-script';
import { EnemyScript } from './enemy-script';
import { ObjectPosition } from './object-position';
import { PortalManagerScript } from './portal-manager-script';
import { TileMap } from './tile-map/tile-map';
import { Tile } from './tile-map/tile-map-types';
import { GameObject } from '../../engine/game-object/game-object';
import { ScreenBuffer } from '../../engine/screen/screen-buffer';
import { LAYER_COUNT } from '../../engine/screen/screen.constants';
import { IEngineState } from '../../engine/i-engine-state';
import { MapHelper } from '../helpers/map.helper';

describe('PlayerScript', () => {
  let engineState: IEngineState;
  let tileMap: TileMap;
  let livesScript: LivesScript;
  let musicPlayer: { register: ReturnType<typeof vi.fn>; play: ReturnType<typeof vi.fn> };
  let player: GameObject;

  function createPlayer(position: { x: number; y: number }): GameObject {
    const { column, row } = MapHelper.screenToMap(position.x, position.y);
    const gameObject = GameObject.create('Player', engineState, position, [
      (go) => PlayerScript.create(go),
      (go) => StateScript.create(go, { column, row }),
      (go) => ObjectPosition.create(go, column, row),
    ]);
    gameObject.start();
    return gameObject;
  }

  // Every new PlayerScript starts frozen in its own Borning (spawn) delay, same as EnemyScript -
  // see the dedicated Borning tests below. Skip past it here with one oversized-deltaTime update
  // to PlayerScript alone (not the whole GameObject - StateScript would misread that same huge
  // deltaTime as a giant movement step), so the dying/lives tests exercise that behavior in isolation.
  function skipBorning(target: GameObject): void {
    const realDeltaTime = engineState.deltaTime;
    engineState.deltaTime = 999;
    target.getScript(PlayerScript)!.update();
    engineState.deltaTime = realDeltaTime;
  }

  function killPlayer(): void {
    tileMap.setTile(1, 2, Tile.Lava);
  }

  beforeEach(() => {
    const gameObjectsByName = new Map<string, GameObject>();
    musicPlayer = { register: vi.fn(), play: vi.fn() };
    engineState = {
      screenBuffer: ScreenBuffer.create(LAYER_COUNT),
      keyboard: { wasPressedThisFrame: () => false } as unknown as IEngineState['keyboard'],
      soundPlayer: {} as IEngineState['soundPlayer'],
      musicPlayer: musicPlayer as unknown as IEngineState['musicPlayer'],
      deltaTime: 1,
      fps: 0,
      timeFromStart: 0,
      startedAt: 0,
      game: {} as IEngineState['game'],
      addGameObject: () => {},
      removeGameObject: () => {},
      getGameObjectByName: (name: string) => gameObjectsByName.get(name),
      getGameObjectsByName: (name: string) => {
        const gameObject = gameObjectsByName.get(name);
        return gameObject ? [gameObject] : [];
      },
      renameGameObject: () => {},
      reset: () => {},
      registerAfterUpdate: (fn: () => void) => fn(),
    };

    const mapGameObject = GameObject.create('Map', engineState, { x: 0, y: 0 }, [(go) => TileMap.create(go)]);
    tileMap = mapGameObject.getScript(TileMap)!;
    gameObjectsByName.set('Map', mapGameObject);

    const portalManagerGameObject = GameObject.create('PortalManager', engineState, { x: 0, y: 0 }, [
      (go) => PortalManagerScript.create(go),
    ]);
    portalManagerGameObject.start();
    gameObjectsByName.set('PortalManager', portalManagerGameObject);

    const livesGameObject = GameObject.create('Lives', engineState, { x: 0, y: 0 }, [(go) => LivesScript.create(go, 2, () => {})]);
    livesScript = livesGameObject.getScript(LivesScript)!;
    gameObjectsByName.set('Lives', livesGameObject);

    player = createPlayer({ x: 8, y: 16 });
    skipBorning(player);
  });

  describe('Borning', () => {
    it('should do nothing and not react to isDying() while still frozen in the spawn delay', () => {
      const newborn = createPlayer({ x: 24, y: 16 });
      tileMap.setTile(3, 2, Tile.Lava);

      expect(() => newborn.update()).not.toThrow();

      expect(musicPlayer.play).not.toHaveBeenCalled();
    });

    it('should resume normal behavior once the spawn delay elapses', () => {
      const newborn = createPlayer({ x: 24, y: 16 });

      skipBorning(newborn);
      tileMap.setTile(3, 2, Tile.Lava);
      newborn.update();
      newborn.update();

      expect(musicPlayer.play).toHaveBeenCalledTimes(1);
    });
  });

  it('should do nothing while the player is not dying', () => {
    expect(() => player.update()).not.toThrow();
    expect(musicPlayer.play).not.toHaveBeenCalled();
  });

  it('should start the death jingle exactly once, the frame after the player begins dying', () => {
    killPlayer();

    player.update(); // StateScript notices the lava and starts dying.
    player.update(); // PlayerScript sees isDying() and begins its own dying sequence.
    player.update(); // Advancing further must not retrigger the jingle.

    expect(musicPlayer.register).toHaveBeenCalledTimes(1);
    expect(musicPlayer.play).toHaveBeenCalledTimes(1);
  });

  it('should not lose a life before the dying timer elapses', () => {
    const loseLife = vi.spyOn(livesScript, 'loseLife');
    killPlayer();

    player.update();
    player.update();

    expect(loseLife).not.toHaveBeenCalled();
  });

  it('should lose exactly one life once the dying timer elapses', () => {
    const loseLife = vi.spyOn(livesScript, 'loseLife');
    killPlayer();

    player.update();
    player.update();
    player.update();

    expect(loseLife).toHaveBeenCalledTimes(1);
  });

  // In the real game, loseLife()'s deferred callback (XLodeRunnerGame's loseLifeCallback, via
  // engineState.registerAfterUpdate) resets the whole level - destroying this exact
  // Player/PlayerScript before it would ever receive another update(). This asserts PlayerScript
  // stays safe even if that didn't happen: the DelayedAction backing `dying` latches once fired,
  // so it never re-triggers the sequence even if isDying() keeps reporting true (which it does
  // indefinitely - StateScript never clears it) and update() keeps being called.
  it('should not lose a second life even if it somehow keeps receiving updates after dying', () => {
    const loseLife = vi.spyOn(livesScript, 'loseLife');
    killPlayer();

    player.update();
    player.update();
    player.update();
    player.update();
    player.update();

    expect(loseLife).toHaveBeenCalledTimes(1);
  });

  describe('touching an enemy', () => {
    function createEnemyAt(column: number, row: number): GameObject {
      const gameObject = GameObject.create('Enemy', engineState, { x: column * 8, y: row * 8 }, [
        (go) => EnemyScript.create(go, { column, row }),
        (go) => ObjectPosition.create(go, column, row),
      ]);
      gameObject.start();
      return gameObject;
    }

    it('should start dying once the player shares a cell with an enemy', () => {
      const { column, row } = player.getScript(ObjectPosition)!;
      createEnemyAt(column, row);

      player.update();

      expect(player.getScript(StateScript)!.isDying()).toBe(true);
    });

    it('should not die while no enemy occupies the same cell', () => {
      createEnemyAt(5, 5);

      player.update();

      expect(player.getScript(StateScript)!.isDying()).toBe(false);
    });
  });
});
