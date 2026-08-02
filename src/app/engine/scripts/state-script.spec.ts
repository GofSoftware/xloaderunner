import { StateScript } from './state-script';
import { TileMap, TileType } from './tile-map';
import { BitmapSpriteRenderer } from './bitmap-sprite-renderer';
import { GameObject } from '../game-object/game-object';
import { Keyboard } from '../keyboard/keyboard';
import { ScreenBuffer } from '../screen/screen-buffer';
import { CELL_SIZE, FOREGROUND_LAYER, LAYER_COUNT, SCREEN_HEIGHT, SCREEN_WIDTH } from '../screen/screen.constants';
import { IEngineState } from '../i-engine-state';
import { MAN_MOVING_LEFT_FRAME_1 } from '../../data/sprites';

describe('StateScript', () => {
  let engineState: IEngineState;
  let keyboard: Keyboard;
  let tileMapGameObject: GameObject;
  let tileMap: TileMap;
  let player: GameObject;

  beforeEach(() => {
    keyboard = Keyboard.create();
    keyboard.attach();
    engineState = {
      screenBuffer: ScreenBuffer.create(LAYER_COUNT),
      keyboard,
      soundPlayer: {} as IEngineState['soundPlayer'],
      musicPlayer: {} as IEngineState['musicPlayer'],
      deltaTime: 1,
      fps: 0,
      addGameObject: () => {},
      removeGameObject: () => {},
    };

    tileMapGameObject = GameObject.create('Map', engineState, { x: 0, y: 0 }, [(go) => TileMap.create(go)]);
    tileMap = tileMapGameObject.getScript(TileMap)!;
    tileMap.setTileAtPixel(8, 24, TileType.Brick);

    player = GameObject.create('Player', engineState, { x: 8, y: 16 }, [
      (go) => StateScript.create(go, tileMap),
      (go) => BitmapSpriteRenderer.create(go, { bitmap: [MAN_MOVING_LEFT_FRAME_1], framePerSecond: 1 }, FOREGROUND_LAYER),
    ]);
    player.start();
  });

  afterEach(() => {
    keyboard.detach();
  });

  it('should stand still when grounded and no key is pressed', () => {
    player.update();

    expect(player.position).toEqual({ x: 8, y: 16 });
  });

  it('should move right while the right arrow is held and the ground holds', () => {
    tileMap.setTileAtPixel(16, 24, TileType.Brick);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

    player.update();

    expect(player.position.x).toBeGreaterThan(8);
    expect(player.position.y).toBe(16);
  });

  it('should not move right when a brick blocks the target cell', () => {
    tileMap.setTileAtPixel(16, 16, TileType.Brick);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

    player.update();

    expect(player.position).toEqual({ x: 8, y: 16 });
  });

  it('should not move left when a brick blocks the target cell', () => {
    tileMap.setTileAtPixel(0, 16, TileType.Brick);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));

    player.update();

    expect(player.position).toEqual({ x: 8, y: 16 });
  });

  it('should not move down when a brick blocks the target cell below', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown' }));

    player.update();

    expect(player.position).toEqual({ x: 8, y: 16 });
  });

  it('should not move up when a brick blocks the target cell above, even while on stairs', () => {
    player.setPosition(32, 16);
    tileMap.setTileAtPixel(32, 16, TileType.Stairs);
    tileMap.setTileAtPixel(32, 8, TileType.Brick);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));

    player.update();

    expect(player.position).toEqual({ x: 32, y: 16 });
  });

  it('should step off an unsupported but non-dangerous ledge immediately, without hesitating', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

    player.update();

    expect(player.position.x).toBeGreaterThan(8);
    expect(player.position.y).toBe(16);
  });

  it('should hesitate before stepping toward a lava cell, without moving immediately', () => {
    tileMap.setTileAtPixel(16, 24, TileType.Lava);
    engineState.deltaTime = 0.1;
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

    player.update();

    expect(player.position).toEqual({ x: 8, y: 16 });
  });

  it('should step toward the lava once the hesitation pause elapses while the key is held', () => {
    tileMap.setTileAtPixel(16, 24, TileType.Lava);
    engineState.deltaTime = 0.1;
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

    player.update();
    player.update();
    expect(player.position.x).toBe(8);

    player.update();
    expect(player.position.x).toBeGreaterThan(8);
  });

  it('should stay put if the key is released and never pressed again before the pause elapses', () => {
    tileMap.setTileAtPixel(16, 24, TileType.Lava);
    engineState.deltaTime = 0.1;
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

    player.update();

    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowRight' }));
    keyboard.next();

    player.update();
    player.update();

    expect(player.position).toEqual({ x: 8, y: 16 });
  });

  it('should step toward the lava if the key is released and pressed again before the pause elapses', () => {
    tileMap.setTileAtPixel(16, 24, TileType.Lava);
    engineState.deltaTime = 0.1;
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

    player.update();

    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowRight' }));
    keyboard.next();

    player.update();
    expect(player.position.x).toBe(8);

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
    player.update();

    expect(player.position.x).toBeGreaterThan(8);
  });

  it('should fall when there is no brick below, regardless of input', () => {
    player.setPosition(100, 16);

    player.update();

    expect(player.position.y).toBeGreaterThan(16);
  });

  it('should clamp horizontal movement so the player never leaves the screen', () => {
    for (let column = 0; column < tileMap.columns; column++) {
      tileMap.setTile(column, 3, TileType.Brick);
    }
    player.setPosition(SCREEN_WIDTH - CELL_SIZE - 2, 16);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

    player.update();

    expect(player.position.x).toBe(SCREEN_WIDTH - CELL_SIZE);
  });

  it('should clamp falling so the player never drops below the screen', () => {
    player.setPosition(100, SCREEN_HEIGHT - CELL_SIZE - 2);

    player.update();

    expect(player.position.y).toBe(SCREEN_HEIGHT - CELL_SIZE);
  });

  it('should finish the current 8px step even if the key is released mid-step', () => {
    tileMap.setTileAtPixel(16, 24, TileType.Brick);
    engineState.deltaTime = 0.05;
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

    player.update();

    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowRight' }));
    keyboard.next();

    player.update();
    player.update();
    expect(player.position.x).toBeLessThan(16);

    player.update();
    expect(player.position.x).toBe(16);

    player.update();
    expect(player.position.x).toBe(16);
  });

  it('should ignore a direction change until the in-progress step completes', () => {
    tileMap.setTileAtPixel(16, 24, TileType.Brick);
    engineState.deltaTime = 0.05;
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

    player.update();

    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowRight' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
    keyboard.next();

    player.update();
    player.update();
    player.update();
    expect(player.position.x).toBe(16);

    player.update();
    expect(player.position.x).toBeLessThan(16);
  });

  it('should commit to a full 8px fall before re-evaluating whether the player has landed', () => {
    player.setPosition(100, 16);
    engineState.deltaTime = 0.05;

    player.update();
    player.update();
    expect(player.position.y).toBeLessThan(24);

    player.update();
    expect(player.position.y).toBe(24);
  });

  it('should stay in place on a stairs tile even without ground below, when no key is pressed', () => {
    player.setPosition(32, 16);
    tileMap.setTileAtPixel(32, 16, TileType.Stairs);

    player.update();

    expect(player.position).toEqual({ x: 32, y: 16 });
  });

  it('should still allow climbing while on a stairs tile with no ground below', () => {
    player.setPosition(32, 16);
    tileMap.setTileAtPixel(32, 16, TileType.Stairs);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));

    player.update();

    expect(player.position.x).toBe(32);
    expect(player.position.y).toBeLessThan(16);
  });

  it('should keep climbing when the next cell up is also a stairs tile', () => {
    player.setPosition(32, 16);
    tileMap.setTileAtPixel(32, 16, TileType.Stairs);
    tileMap.setTileAtPixel(32, 8, TileType.Stairs);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));

    player.update();

    expect(player.position.x).toBe(32);
    expect(player.position.y).toBeLessThan(16);
  });

  it('should stay in place on a crossbar tile even without ground below, when no key is pressed', () => {
    player.setPosition(32, 16);
    tileMap.setTileAtPixel(32, 16, TileType.Crossbar);

    player.update();

    expect(player.position).toEqual({ x: 32, y: 16 });
  });

  it('should stop falling once it reaches a crossbar tile', () => {
    player.setPosition(100, 16);
    tileMap.setTileAtPixel(100, 24, TileType.Crossbar);
    engineState.deltaTime = 0.05;

    player.update();
    player.update();
    expect(player.position.y).toBeLessThan(24);

    player.update();
    expect(player.position.y).toBe(24);

    player.update();
    expect(player.position.y).toBe(24);
  });

  it('should move left along a crossbar', () => {
    player.setPosition(32, 16);
    tileMap.setTileAtPixel(32, 16, TileType.Crossbar);
    tileMap.setTileAtPixel(24, 16, TileType.Crossbar);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));

    player.update();

    expect(player.position.x).toBeLessThan(32);
    expect(player.position.y).toBe(16);
  });

  it('should move right along a crossbar', () => {
    player.setPosition(32, 16);
    tileMap.setTileAtPixel(32, 16, TileType.Crossbar);
    tileMap.setTileAtPixel(40, 16, TileType.Crossbar);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

    player.update();

    expect(player.position.x).toBeGreaterThan(32);
    expect(player.position.y).toBe(16);
  });

  it('should not move along a crossbar when a brick blocks the target cell', () => {
    player.setPosition(32, 16);
    tileMap.setTileAtPixel(32, 16, TileType.Crossbar);
    tileMap.setTileAtPixel(24, 16, TileType.Brick);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));

    player.update();

    expect(player.position).toEqual({ x: 32, y: 16 });
  });

  it('should ignore the up arrow while grounded on a non-stairs tile', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));

    player.update();

    expect(player.position).toEqual({ x: 8, y: 16 });
  });
});
