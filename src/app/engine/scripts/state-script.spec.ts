import { StateScript } from './state-script';
import { TileMap, TileType } from './tile-map';
import { BitmapSpriteRenderer } from './bitmap-sprite-renderer';
import { GameObject } from '../game-object/game-object';
import { Keyboard } from '../keyboard/keyboard';
import { ScreenBuffer } from '../screen/screen-buffer';
import { __, CELL_SIZE, SCREEN_HEIGHT, SCREEN_WIDTH } from '../screen/screen.constants';
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
      screenBuffer: ScreenBuffer.create(),
      keyboard,
      soundPlayer: {} as IEngineState['soundPlayer'],
      musicPlayer: {} as IEngineState['musicPlayer'],
      deltaTime: 1,
      fps: 0,
    };

    tileMapGameObject = GameObject.create('Map', engineState, { x: 0, y: 0 }, [(go) => TileMap.create(go)]);
    tileMap = tileMapGameObject.getScript(TileMap)!;
    tileMap.setTileAtPixel(8, 24, TileType.Brick);

    player = GameObject.create('Player', engineState, { x: 8, y: 16 }, [
      (go) => StateScript.create(go, tileMap),
      (go) => BitmapSpriteRenderer.create(go, [MAN_MOVING_LEFT_FRAME_1], 1),
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
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

    player.update();

    expect(player.position.x).toBeGreaterThan(8);
    expect(player.position.y).toBe(16);
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

  it('should clear the previous position after moving away from an empty cell', () => {
    engineState.screenBuffer.copy([[0xffffffff]], 8, 16);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

    player.update();

    expect(engineState.screenBuffer.buffer[16][8]).toBe(__);
  });

  it('should leave the previous position untouched if a solid tile already covers it', () => {
    tileMap.setTileAtPixel(8, 16, TileType.Stairs);
    engineState.screenBuffer.copy([[0xff0000ff]], 8, 16);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

    player.update();

    expect(engineState.screenBuffer.buffer[16][8]).toBe(0xff0000ff);
  });
});
