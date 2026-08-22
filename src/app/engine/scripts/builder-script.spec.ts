import { BuilderScript } from './builder-script';
import { ObjectPosition } from './object-position';
import { TileMap, TileType } from './tile-map';
import { StateScript } from './state-script';
import { KeyboardInputScript } from './keyboard-input-script';
import { LivesScript, MAX_LIVES } from './lives-script';
import { GameObject } from '../game-object/game-object';
import { Keyboard } from '../keyboard/keyboard';
import { ScreenBuffer } from '../screen/screen-buffer';
import { CELL_SIZE, LAYER_COUNT, SCREEN_WIDTH } from '../screen/screen.constants';
import { OBJECT_HAMMER } from '../../data/sprites';
import { IEngineState } from '../i-engine-state';

const HUD_LAYER = 1;
const HUD_START_X = SCREEN_WIDTH - MAX_LIVES * CELL_SIZE;

describe('BuilderScript', () => {
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

  function regionAt(x: number): number[][] {
    return engineState.screenBuffer.buffers[HUD_LAYER].slice(CELL_SIZE, CELL_SIZE * 2).map((row) => row.slice(x, x + CELL_SIZE));
  }

  function createPlayer(column: number, row: number): GameObject {
    const gameObject = GameObject.create('Player', engineState, { x: column * 8, y: row * 8 }, [
      (go) => ObjectPosition.create(go, column, row),
      (go) => BuilderScript.create(go, HUD_LAYER),
    ]);
    gameObject.start();
    return gameObject;
  }

  // A player with a real StateScript, standing on a brick floor, so pressing an arrow key actually
  // turns/moves it and BuilderScript can read a facing direction other than the Right fallback.
  function createMovingPlayer(): GameObject {
    for (let column = 0; column <= 8; column++) {
      tileMap.setTile(column, 6, TileType.Brick);
    }
    const livesGameObject = GameObject.create('Lives', engineState, { x: 0, y: 0 }, [(go) => LivesScript.create(go, 2)]);
    gameObjectsByName.set('Lives', livesGameObject);

    const movingPlayer = GameObject.create('MovingPlayer', engineState, { x: 5 * 8, y: 5 * 8 }, [
      (go) => KeyboardInputScript.create(go),
      (go) => BuilderScript.create(go, HUD_LAYER),
      (go) => StateScript.create(go, { column: 5, row: 5 }),
      (go) => ObjectPosition.create(go, 5, 5),
    ]);
    movingPlayer.start();
    return movingPlayer;
  }

  beforeEach(() => {
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
  });

  it('does nothing when no build/remove key is pressed', () => {
    press('ArrowRight');
    player.update();

    expect(tileMap.getTile(6, 5)).toBe(TileType.Empty);
  });

  it('builds a brick immediately, in the cell the player faces (Right by default)', () => {
    press('Digit1');
    player.update();

    expect(tileMap.getTile(6, 5)).toBe(TileType.Brick);
    expect(gameObjectsByName.has('Tile-6-5')).toBe(true);
  });

  it('builds stairs immediately when Digit2 is pressed', () => {
    press('Digit2');
    player.update();

    expect(tileMap.getTile(6, 5)).toBe(TileType.Stairs);
  });

  it('builds a crossbar immediately when Digit3 is pressed', () => {
    press('Digit3');
    player.update();

    expect(tileMap.getTile(6, 5)).toBe(TileType.Crossbar);
  });

  it('does not build over a cell that is already occupied', () => {
    tileMap.setTile(6, 5, TileType.Brick);

    press('Digit1');
    player.update();

    expect(gameObjectsByName.has('Tile-6-5')).toBe(false);
  });

  it('does not build outside the map bounds', () => {
    const edgePlayer = createPlayer(tileMap.columns - 1, 5);

    press('Digit1');
    expect(() => edgePlayer.update()).not.toThrow();
  });

  describe('remove', () => {
    function createTrackedTile(column: number, row: number, type: TileType): GameObject {
      tileMap.setTile(column, row, type);
      const tileGameObject = GameObject.create(`Tile-${column}-${row}`, engineState, { x: column * 8, y: row * 8 }, [
        (go) => ObjectPosition.create(go, column, row),
      ]);
      engineState.addGameObject(tileGameObject);
      return tileGameObject;
    }

    it('removes a brick immediately in the cell the player faces, and destroys its game object', () => {
      createTrackedTile(6, 5, TileType.Brick);

      press('Digit0');
      player.update();

      expect(tileMap.getTile(6, 5)).toBe(TileType.Empty);
      expect(gameObjectsByName.has('Tile-6-5')).toBe(false);
    });

    it('removes stairs and a crossbar the same way, on separate presses', () => {
      createTrackedTile(6, 5, TileType.Stairs);

      press('Digit0');
      player.update();
      nextFrame();

      expect(tileMap.getTile(6, 5)).toBe(TileType.Empty);
    });

    it('does not remove lava, gold, or player-start tiles', () => {
      tileMap.setTile(6, 5, TileType.Lava);

      press('Digit0');
      player.update();

      expect(tileMap.getTile(6, 5)).toBe(TileType.Lava);
    });
  });

  describe('facing direction', () => {
    it('builds to the right by default, with no StateScript to ask', () => {
      press('Digit1');
      player.update();

      expect(tileMap.getTile(6, 5)).toBe(TileType.Brick);
    });

    it('builds in whichever direction the player is currently facing, not always to the right', () => {
      const movingPlayer = createMovingPlayer();
      const objectPosition = movingPlayer.getScript(ObjectPosition)!;

      press('ArrowLeft');
      movingPlayer.update();
      release('ArrowLeft');
      movingPlayer.update();
      nextFrame();

      const { column, row } = objectPosition;
      press('Digit1');
      movingPlayer.update();

      expect(tileMap.getTile(column - 1, row)).toBe(TileType.Brick);
      // Sanity check: it did not fall back to building on the original (Right) side.
      expect(tileMap.getTile(column + 1, row)).toBe(TileType.Empty);
    });
  });

  describe('HUD', () => {
    it('always draws the hammer icon', () => {
      player.update();

      expect(regionAt(HUD_START_X)).toEqual(OBJECT_HAMMER);
    });
  });
});
