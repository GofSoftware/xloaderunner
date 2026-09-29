import { vi } from 'vitest';
import { PlayerScript } from './player-script';
import { StateScript } from './state-script';
import { LivesScript } from './lives-script';
import { ObjectPosition } from './object-position';
import { PortalManagerScript } from './portal-manager-script';
import { TileMap } from './tile-map/tile-map';
import { TileType } from './tile-map/tile-map-types';
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

  function killPlayer(): void {
    tileMap.setTile(1, 2, TileType.Lava);
  }

  beforeEach(() => {
    const gameObjectsByName = new Map<string, GameObject>();
    musicPlayer = { register: vi.fn(), play: vi.fn() };
    engineState = {
      screenBuffer: ScreenBuffer.create(LAYER_COUNT),
      keyboard: {} as IEngineState['keyboard'],
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

  // Not tested further past this point: in the real game, loseLife()'s deferred callback
  // (XLodeRunnerGame's loseLifeCallback, via engineState.registerAfterUpdate) resets the whole
  // level - destroying this exact Player/PlayerScript before it could ever receive another
  // update(). PlayerScript itself has no guard against re-entering its dying sequence if it
  // somehow did receive one anyway (isDying() stays true on StateScript indefinitely) - it relies
  // entirely on being destroyed in time, the same way this test's registerAfterUpdate mock does.
  it('should lose exactly one life once the dying timer elapses', () => {
    const loseLife = vi.spyOn(livesScript, 'loseLife');
    killPlayer();

    player.update();
    player.update();
    player.update();

    expect(loseLife).toHaveBeenCalledTimes(1);
  });
});
