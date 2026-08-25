import { BlastedBrickScript } from './blasted-brick-script';
import { BuilderScript } from './builder-script';
import { ObjectPosition } from '../../engine/scripts/object-position';
import { TileMap, TileType } from './tile-map';
import { StateScript } from './state-script';
import { KeyboardInputScript } from '../../engine/scripts/keyboard-input-script';
import { LivesScript } from './lives-script';
import { GameObject } from '../../engine/game-object/game-object';
import { Keyboard } from '../../engine/keyboard/keyboard';
import { ScreenBuffer } from '../../engine/screen/screen-buffer';
import { LAYER_COUNT } from '../../engine/screen/screen.constants';
import { IEngineState } from '../../engine/i-engine-state';

const HUD_LAYER = 1;

describe('BlastedBrickScript', () => {
  let engineState: IEngineState;
  let keyboard: Keyboard;
  let tileMap: TileMap;
  let player: GameObject;
  let gameObjectsByName: Map<string, GameObject>;

  function press(code: string): void {
    window.dispatchEvent(new KeyboardEvent('keydown', { code }));
  }

  function release(code: string): void {
    window.dispatchEvent(new KeyboardEvent('keyup', { code }));
  }

  function nextFrame(): void {
    keyboard.next();
  }

  function createPlayer(column: number, row: number): GameObject {
    const gameObject = GameObject.create('Player', engineState, { x: column * 8, y: row * 8 }, [
      (go) => ObjectPosition.create(go, column, row),
      (go) => BlastedBrickScript.create(go),
      (go) => BuilderScript.create(go, HUD_LAYER),
    ]);
    gameObject.start();
    return gameObject;
  }

  // A player with a real StateScript, standing on a brick floor, so pressing an arrow key actually
  // turns/moves it and BlastedBrickScript can read a facing direction other than the Right fallback.
  function createMovingPlayer(): GameObject {
    for (let column = 0; column <= 8; column++) {
      tileMap.setTile(column, 6, TileType.Brick);
    }
    const livesGameObject = GameObject.create('Lives', engineState, { x: 0, y: 0 }, [(go) => LivesScript.create(go, 2)]);
    gameObjectsByName.set('Lives', livesGameObject);

    const movingPlayer = GameObject.create('MovingPlayer', engineState, { x: 5 * 8, y: 5 * 8 }, [
      (go) => KeyboardInputScript.create(go),
      (go) => BlastedBrickScript.create(go),
      (go) => BuilderScript.create(go, HUD_LAYER),
      (go) => StateScript.create(go, { column: 5, row: 5 }),
      (go) => ObjectPosition.create(go, 5, 5),
    ]);
    movingPlayer.start();
    return movingPlayer;
  }

  beforeEach(() => {
    vi.useFakeTimers();
    keyboard = Keyboard.create();
    keyboard.attach();
    gameObjectsByName = new Map<string, GameObject>();
    engineState = {
      screenBuffer: ScreenBuffer.create(LAYER_COUNT),
      keyboard,
      soundPlayer: {} as IEngineState['soundPlayer'],
      musicPlayer: {} as IEngineState['musicPlayer'],
      deltaTime: 1,
      fps: 0,
      timeFromStart: 0,
      startedAt: 0,
      addGameObject: (gameObject: GameObject) => {
        gameObjectsByName.set(gameObject.name, gameObject);
        gameObject.start();
      },
      removeGameObject: (gameObject: GameObject) => gameObjectsByName.delete(gameObject.name),
      getGameObjectByName: (name: string) => gameObjectsByName.get(name),
    };

    const mapGameObject = GameObject.create('Map', engineState, { x: 0, y: 0 }, [(go) => TileMap.create(go)]);
    tileMap = mapGameObject.getScript(TileMap)!;
    gameObjectsByName.set('Map', mapGameObject);

    player = createPlayer(5, 5);
  });

  afterEach(() => {
    keyboard.detach();
    vi.useRealTimers();
  });

  function createTrackedTile(column: number, row: number, type: TileType): GameObject {
    tileMap.setTile(column, row, type);
    const tileGameObject = GameObject.create(`Tile-${column}-${row}`, engineState, { x: column * 8, y: row * 8 }, [
      (go) => ObjectPosition.create(go, column, row),
    ]);
    engineState.addGameObject(tileGameObject);
    return tileGameObject;
  }

  it('does nothing when Space is not pressed', () => {
    createTrackedTile(6, 6, TileType.Brick);

    player.update();

    expect(tileMap.getTile(6, 6)).toBe(TileType.Brick);
  });

  it('does nothing when the ground ahead (in the facing direction, one row down) is not a Brick', () => {
    press('Space');
    player.update();

    expect(tileMap.getTile(6, 6)).toBe(TileType.Empty);
  });

  it('blasts the brick ahead and one row down, in the facing direction (Right by default), and destroys its game object', () => {
    createTrackedTile(6, 6, TileType.Brick);

    press('Space');
    player.update();

    expect(tileMap.getTile(6, 6)).toBe(TileType.BlastedBrick);
    expect(gameObjectsByName.has('Tile-6-6')).toBe(false);
  });

  it('does not let the player build over a blasted cell', () => {
    // Simulates a cell that was already blasted (rather than re-deriving it here) so this test is
    // only about BuilderScript's own Empty-only check, not about the blast targeting math above.
    tileMap.setTile(6, 5, TileType.BlastedBrick);

    press('Digit1');
    player.update();

    expect(tileMap.getTile(6, 5)).toBe(TileType.BlastedBrick);
    expect(gameObjectsByName.has('Tile-6-5')).toBe(false);
  });

  it('reverts a blasted brick back to a regular Brick after 5 seconds', () => {
    createTrackedTile(6, 6, TileType.Brick);

    press('Space');
    player.update();

    vi.advanceTimersByTime(5000);

    expect(tileMap.getTile(6, 6)).toBe(TileType.Brick);
    expect(gameObjectsByName.has('Tile-6-6')).toBe(true);
  });

  it('does not revert before the 5 seconds have elapsed', () => {
    createTrackedTile(6, 6, TileType.Brick);

    press('Space');
    player.update();

    vi.advanceTimersByTime(4999);

    expect(tileMap.getTile(6, 6)).toBe(TileType.BlastedBrick);
  });

  it('blasts in whichever direction the player is currently facing, not always to the right', () => {
    const movingPlayer = createMovingPlayer();
    createTrackedTile(3, 6, TileType.Brick);

    press('ArrowLeft');
    movingPlayer.update();
    release('ArrowLeft');
    movingPlayer.update();
    nextFrame();

    press('Space');
    movingPlayer.update();

    expect(tileMap.getTile(3, 6)).toBe(TileType.BlastedBrick);
  });
});
