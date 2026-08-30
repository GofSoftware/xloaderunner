import { BuildableTileType, BuilderScript, DEFAULT_BUILD_COUNTS, DEFAULT_REMOVE_COUNT } from './builder-script';
import { ObjectPosition } from './object-position';
import { TileMap } from './tile-map/tile-map';
import { TileType } from './tile-map/tile-map-types';
import { StateScript } from './state-script';
import { KeyboardInputScript } from '../../engine/scripts/keyboard-input-script';
import { LivesScript } from './lives-script';
import { GameObject } from '../../engine/game-object/game-object';
import { Keyboard } from '../../engine/keyboard/keyboard';
import { ScreenBuffer } from '../../engine/screen/screen-buffer';
import { CELL_SIZE, LAYER_COUNT } from '../../engine/screen/screen.constants';
import { OBJECT_BRICK, OBJECT_CROSSBAR, OBJECT_MIRROR_RB, OBJECT_REMOVE, OBJECT_STAIRS } from '../data/sprites';
import { GLYPH_MAP } from '../data/glyphs';
import { IEngineState } from '../../engine/i-engine-state';

const HUD_LAYER = 1;

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

  function hudRegionAt(x: number): number[][] {
    return engineState.screenBuffer.buffers[HUD_LAYER].slice(0, CELL_SIZE).map((row) => row.slice(x, x + CELL_SIZE));
  }

  function createTrackedTile(column: number, row: number, type: TileType): GameObject {
    tileMap.setTile(column, row, type);
    const tileGameObject = GameObject.create(`Tile-${column}-${row}`, engineState, { x: column * 8, y: row * 8 }, [
      (go) => ObjectPosition.create(go, column, row),
    ]);
    engineState.addGameObject(tileGameObject);
    return tileGameObject;
  }

  function createPlayer(
    column: number,
    row: number,
    counts: Record<BuildableTileType, number> = DEFAULT_BUILD_COUNTS,
    removeCount: number = DEFAULT_REMOVE_COUNT,
  ): GameObject {
    const gameObject = GameObject.create('Player', engineState, { x: column * 8, y: row * 8 }, [
      (go) => ObjectPosition.create(go, column, row),
      (go) => BuilderScript.create(go, HUD_LAYER, counts, removeCount),
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
      timeFromStart: 0,
      startedAt: 0,
      level: {} as IEngineState['level'],
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

  describe('supply', () => {
    it('refuses to build a type once its supply reaches zero', () => {
      const brickless = createPlayer(5, 5, { ...DEFAULT_BUILD_COUNTS, [TileType.Brick]: 0 });

      press('Digit1');
      brickless.update();

      expect(tileMap.getTile(6, 5)).toBe(TileType.Empty);
    });

    it('decrements the supply of the type just built', () => {
      const limited = createPlayer(5, 5, { ...DEFAULT_BUILD_COUNTS, [TileType.Brick]: 1 });

      press('Digit1');
      limited.update();
      nextFrame();
      // The first brick already occupies (6, 5); move the offset by removing it and re-pressing
      // Digit1 to confirm the supply - not just the occupied cell - is what blocks the second build.
      tileMap.setTile(6, 5, TileType.Empty);

      press('Digit1');
      limited.update();

      expect(tileMap.getTile(6, 5)).toBe(TileType.Empty);
    });

    it('restocks the supply of the removed type after a remove', () => {
      const limited = createPlayer(5, 5, { ...DEFAULT_BUILD_COUNTS, [TileType.Brick]: 1 });

      press('Digit1');
      limited.update();
      nextFrame();

      press('Digit0');
      limited.update();
      nextFrame();

      press('Digit1');
      limited.update();

      expect(tileMap.getTile(6, 5)).toBe(TileType.Brick);
    });

    it('never displays a restocked supply above 99', () => {
      const nearlyFull = createPlayer(5, 5, { ...DEFAULT_BUILD_COUNTS, [TileType.Brick]: 99 });
      createTrackedTile(6, 5, TileType.Brick);

      press('Digit0');
      nearlyFull.update();

      expect(hudRegionAt(CELL_SIZE)).toEqual(GLYPH_MAP['9']);
      expect(hudRegionAt(CELL_SIZE * 2)).toEqual(GLYPH_MAP['9']);
    });
  });

  describe('remove', () => {
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

    it('refuses to remove once the remove supply reaches zero', () => {
      createTrackedTile(6, 5, TileType.Brick);
      const removeless = createPlayer(5, 5, DEFAULT_BUILD_COUNTS, 0);

      press('Digit0');
      removeless.update();

      expect(tileMap.getTile(6, 5)).toBe(TileType.Brick);
      expect(gameObjectsByName.has('Tile-6-5')).toBe(true);
    });

    it('decrements the remove supply on every successful removal, and is never restocked', () => {
      createTrackedTile(6, 5, TileType.Brick);
      const limited = createPlayer(5, 5, DEFAULT_BUILD_COUNTS, 1);

      press('Digit0');
      limited.update();
      nextFrame();

      expect(hudRegionAt(CELL_SIZE * 13)).toEqual(GLYPH_MAP['0']);

      createTrackedTile(6, 5, TileType.Brick);
      press('Digit0');
      limited.update();

      expect(tileMap.getTile(6, 5)).toBe(TileType.Brick);
      expect(gameObjectsByName.has('Tile-6-5')).toBe(true);
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
    const items: { type: TileType; icon: number[][]; x: number; digits: [string, string] }[] = [
      { type: TileType.Brick, icon: OBJECT_BRICK, x: 0, digits: ['9', '9'] },
      { type: TileType.Stairs, icon: OBJECT_STAIRS, x: CELL_SIZE * 3, digits: ['9', '9'] },
      { type: TileType.Crossbar, icon: OBJECT_CROSSBAR, x: CELL_SIZE * 6, digits: ['9', '9'] },
      { type: TileType.MirrorRB, icon: OBJECT_MIRROR_RB, x: CELL_SIZE * 9, digits: ['9', '9'] },
      { type: TileType.Empty, icon: OBJECT_REMOVE, x: CELL_SIZE * 12, digits: ['9', '9'] },
    ];

    it('draws every buildable type, plus remove, at the top-left corner, icon followed by its two-digit supply', () => {
      player.update();

      for (const { icon, x, digits } of items) {
        expect(hudRegionAt(x)).toEqual(icon);
        expect(hudRegionAt(x + CELL_SIZE)).toEqual(GLYPH_MAP[digits[0]]);
        expect(hudRegionAt(x + CELL_SIZE * 2)).toEqual(GLYPH_MAP[digits[1]]);
      }
    });

    it('updates the displayed supply after a build', () => {
      press('Digit1');
      player.update();

      expect(hudRegionAt(CELL_SIZE)).toEqual(GLYPH_MAP['9']);
      expect(hudRegionAt(CELL_SIZE * 2)).toEqual(GLYPH_MAP['8']);
    });

    it('updates the displayed remove supply after a removal', () => {
      createTrackedTile(6, 5, TileType.Brick);

      press('Digit0');
      player.update();

      expect(hudRegionAt(CELL_SIZE * 13)).toEqual(GLYPH_MAP['9']);
      expect(hudRegionAt(CELL_SIZE * 14)).toEqual(GLYPH_MAP['8']);
    });
  });
});
