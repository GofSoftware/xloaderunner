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
import { OBJECT_BRICK, OBJECT_CROSSBAR, OBJECT_HAMMER, OBJECT_STAIRS } from '../../data/sprites';
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

  it('does nothing on an arrow key press while unarmed', () => {
    press('ArrowRight');
    player.update();

    expect(tileMap.getTile(6, 5)).toBe(TileType.Empty);
  });

  it('arms brick and builds it in the cell the arrow key points to', () => {
    press('Digit1');
    player.update();
    nextFrame();

    press('ArrowRight');
    player.update();

    expect(tileMap.getTile(6, 5)).toBe(TileType.Brick);
    expect(gameObjectsByName.has('Tile-6-5')).toBe(true);
  });

  it('builds stairs above the player when Digit2 then ArrowUp is pressed', () => {
    press('Digit2');
    player.update();
    nextFrame();

    press('ArrowUp');
    player.update();

    expect(tileMap.getTile(5, 4)).toBe(TileType.Stairs);
  });

  it('builds a crossbar below the player when Digit3 then ArrowDown is pressed', () => {
    press('Digit3');
    player.update();
    nextFrame();

    press('ArrowDown');
    player.update();

    expect(tileMap.getTile(5, 6)).toBe(TileType.Crossbar);
  });

  it('cancels the armed type when the same number key is pressed again', () => {
    press('Digit1');
    player.update();
    nextFrame();

    press('Digit1');
    player.update();
    nextFrame();

    press('ArrowRight');
    player.update();

    expect(tileMap.getTile(6, 5)).toBe(TileType.Empty);
  });

  it('switches the armed type when a different number key is pressed while armed', () => {
    press('Digit1');
    player.update();
    nextFrame();

    press('Digit2');
    player.update();
    nextFrame();

    press('ArrowLeft');
    player.update();

    expect(tileMap.getTile(4, 5)).toBe(TileType.Stairs);
  });

  it('does not build over a cell that is already occupied', () => {
    tileMap.setTile(6, 5, TileType.Brick);

    press('Digit1');
    player.update();
    nextFrame();

    press('ArrowRight');
    player.update();

    expect(gameObjectsByName.has('Tile-6-5')).toBe(false);
  });

  it('disarms after a failed build so a stale arrow press cannot trigger a later build', () => {
    tileMap.setTile(6, 5, TileType.Brick);

    press('Digit1');
    player.update();
    nextFrame();

    press('ArrowRight');
    player.update();
    nextFrame();

    press('ArrowLeft');
    player.update();

    expect(tileMap.getTile(4, 5)).toBe(TileType.Empty);
  });

  it('builds in the cell adjacent to the player even when the same arrow key also moves it that frame', () => {
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

    press('Digit1');
    movingPlayer.update();
    nextFrame();

    press('ArrowRight');
    movingPlayer.update();

    expect(tileMap.getTile(6, 5)).toBe(TileType.Brick);
    expect(tileMap.getTile(7, 5)).toBe(TileType.Empty);
  });

  it('does not build outside the map bounds', () => {
    const edgePlayer = createPlayer(tileMap.columns - 1, 5);

    press('Digit1');
    edgePlayer.update();
    nextFrame();

    press('ArrowRight');
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

    it('removes a brick at the cell the arrow key points to, and destroys its game object', () => {
      createTrackedTile(6, 5, TileType.Brick);

      press('Digit0');
      player.update();
      nextFrame();

      press('ArrowRight');
      player.update();

      expect(tileMap.getTile(6, 5)).toBe(TileType.Empty);
      expect(gameObjectsByName.has('Tile-6-5')).toBe(false);
    });

    it('removes stairs and a crossbar the same way', () => {
      createTrackedTile(5, 4, TileType.Stairs);
      createTrackedTile(5, 6, TileType.Crossbar);

      press('Digit0');
      player.update();
      nextFrame();
      press('ArrowUp');
      player.update();
      nextFrame();

      press('Digit0');
      player.update();
      nextFrame();
      press('ArrowDown');
      player.update();

      expect(tileMap.getTile(5, 4)).toBe(TileType.Empty);
      expect(tileMap.getTile(5, 6)).toBe(TileType.Empty);
    });

    it('does not remove lava, gold, or player-start tiles', () => {
      tileMap.setTile(6, 5, TileType.Lava);

      press('Digit0');
      player.update();
      nextFrame();

      press('ArrowRight');
      player.update();

      expect(tileMap.getTile(6, 5)).toBe(TileType.Lava);
    });

    it('cancels the armed removal when Digit0 is pressed again', () => {
      createTrackedTile(6, 5, TileType.Brick);

      press('Digit0');
      player.update();
      nextFrame();

      press('Digit0');
      player.update();
      nextFrame();

      press('ArrowRight');
      player.update();

      expect(tileMap.getTile(6, 5)).toBe(TileType.Brick);
    });

    it('switches from an armed build type to remove when Digit0 is pressed', () => {
      createTrackedTile(6, 5, TileType.Brick);

      press('Digit1');
      player.update();
      nextFrame();

      press('Digit0');
      player.update();
      nextFrame();

      press('ArrowRight');
      player.update();

      expect(tileMap.getTile(6, 5)).toBe(TileType.Empty);
    });

    it('switches from armed remove to a build type when a number key is pressed', () => {
      press('Digit0');
      player.update();
      nextFrame();

      press('Digit1');
      player.update();
      nextFrame();

      press('ArrowRight');
      player.update();

      expect(tileMap.getTile(6, 5)).toBe(TileType.Brick);
    });

    it('disarms after removing so a stale arrow press does not remove again', () => {
      createTrackedTile(6, 5, TileType.Brick);
      createTrackedTile(4, 5, TileType.Brick);

      press('Digit0');
      player.update();
      nextFrame();

      press('ArrowRight');
      player.update();
      nextFrame();

      press('ArrowLeft');
      player.update();

      expect(tileMap.getTile(4, 5)).toBe(TileType.Brick);
    });
  });

  describe('HUD', () => {
    it('always draws the hammer icon, armed or not', () => {
      player.update();

      expect(regionAt(HUD_START_X)).toEqual(OBJECT_HAMMER);
    });

    it('shows no build-tile preview while unarmed', () => {
      player.update();

      expect(regionAt(HUD_START_X + CELL_SIZE)).toEqual(OBJECT_HAMMER.map((row) => row.map(() => 0)));
    });

    it('previews the armed tile type next to the hammer', () => {
      press('Digit1');
      player.update();

      expect(regionAt(HUD_START_X + CELL_SIZE)).toEqual(OBJECT_BRICK);
    });

    it('clears the preview once the armed type is cancelled', () => {
      press('Digit1');
      player.update();
      nextFrame();

      press('Digit1');
      // Mirrors Engine.render() clearing the buffer once per frame before scripts redraw it -
      // without this, the previous frame's brick preview would still be sitting in the buffer.
      engineState.screenBuffer.clear();
      player.update();

      expect(regionAt(HUD_START_X + CELL_SIZE)).toEqual(OBJECT_BRICK.map((row) => row.map(() => 0)));
    });

    it('updates the preview when switching to a different armed type', () => {
      press('Digit1');
      player.update();
      nextFrame();

      press('Digit2');
      player.update();

      expect(regionAt(HUD_START_X + CELL_SIZE)).toEqual(OBJECT_STAIRS);
    });

    it('previews a crossbar when Digit3 is armed', () => {
      press('Digit3');
      player.update();

      expect(regionAt(HUD_START_X + CELL_SIZE)).toEqual(OBJECT_CROSSBAR);
    });

    it('shows no build-tile preview while remove is armed', () => {
      press('Digit0');
      player.update();

      expect(regionAt(HUD_START_X + CELL_SIZE)).toEqual(OBJECT_HAMMER.map((row) => row.map(() => 0)));
    });
  });
});
