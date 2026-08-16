import { StateScript } from './state-script';
import { TileMap, TileType } from './tile-map';
import { BitmapSpriteRenderer } from './bitmap-sprite-renderer';
import { KeyboardInputScript } from './keyboard-input-script';
import { ObjectPosition } from './object-position';
import { MapHelper } from './map.helper';
import { GameObject } from '../game-object/game-object';
import { Keyboard } from '../keyboard/keyboard';
import { ScreenBuffer } from '../screen/screen-buffer';
import { CELL_SIZE, FOREGROUND_LAYER, LAYER_COUNT, SCREEN_HEIGHT, SCREEN_WIDTH } from '../screen/screen.constants';
import { IEngineState } from '../i-engine-state';
import { MAN_MOVING_LEFT_FRAME_1 } from '../../data/sprites';
import { LivesScript } from './lives-script';

describe('StateScript', () => {
  let engineState: IEngineState;
  let keyboard: Keyboard;
  let tileMap: TileMap;
  let livesScript: LivesScript;
  let spawnCell: { column: number; row: number };
  let player: GameObject;

  function createPlayer(position: { x: number; y: number }): GameObject {
    const { column, row } = MapHelper.screenToMap(position.x, position.y);
    const gameObject = GameObject.create('Player', engineState, position, [
      (go) => KeyboardInputScript.create(go),
      (go) => StateScript.create(go, spawnCell),
      (go) => ObjectPosition.create(go, column, row),
      (go) => BitmapSpriteRenderer.create(go, { bitmap: [MAN_MOVING_LEFT_FRAME_1], framePerSecond: 1 }, FOREGROUND_LAYER),
    ]);
    gameObject.start();
    return gameObject;
  }

  function teleportPlayer(target: GameObject, column: number, row: number): void {
    target.getScript(ObjectPosition)!.teleportTo(column, row);
  }

  beforeEach(() => {
    keyboard = Keyboard.create();
    keyboard.attach();
    const gameObjectsByName = new Map<string, GameObject>();
    engineState = {
      screenBuffer: ScreenBuffer.create(LAYER_COUNT),
      keyboard,
      soundPlayer: {} as IEngineState['soundPlayer'],
      musicPlayer: { register: () => {}, play: () => {} } as unknown as IEngineState['musicPlayer'],
      deltaTime: 1,
      fps: 0,
      addGameObject: () => {},
      removeGameObject: () => {},
      getGameObjectByName: (name: string) => gameObjectsByName.get(name),
    };

    const tileMapGameObject = GameObject.create('Map', engineState, { x: 0, y: 0 }, [(go) => TileMap.create(go)]);
    tileMap = tileMapGameObject.getScript(TileMap)!;
    tileMap.setTile(1, 3, TileType.Brick);
    gameObjectsByName.set('Map', tileMapGameObject);

    const livesGameObject = GameObject.create('Lives', engineState, { x: 0, y: 0 }, [(go) => LivesScript.create(go, 2)]);
    livesScript = livesGameObject.getScript(LivesScript)!;
    gameObjectsByName.set('Lives', livesGameObject);

    spawnCell = { column: 1, row: 2 };
    player = createPlayer({ x: 8, y: 16 });
  });

  afterEach(() => {
    keyboard.detach();
  });

  it('should stand still when grounded and no key is pressed', () => {
    player.update();

    expect(player.position).toEqual({ x: 8, y: 16 });
  });

  it('should move right while the right arrow is held and the ground holds', () => {
    tileMap.setTile(2, 3, TileType.Brick);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

    player.update();

    expect(player.position.x).toBeGreaterThan(8);
    expect(player.position.y).toBe(16);
  });

  it('should not move right when forceRight(false) clears the force before StateScript reads it', () => {
    tileMap.setTile(2, 3, TileType.Brick);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

    player.getScript(KeyboardInputScript)!.update();
    player.getScript(StateScript)!.forceRight(false);
    player.getScript(StateScript)!.update();

    expect(player.position).toEqual({ x: 8, y: 16 });
  });

  it('should not move right when a brick blocks the target cell', () => {
    tileMap.setTile(2, 2, TileType.Brick);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

    player.update();

    expect(player.position).toEqual({ x: 8, y: 16 });
  });

  it('should not move left when a brick blocks the target cell', () => {
    tileMap.setTile(0, 2, TileType.Brick);
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
    teleportPlayer(player, 4, 2);
    tileMap.setTile(4, 2, TileType.Stairs);
    tileMap.setTile(4, 1, TileType.Brick);
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
    tileMap.setTile(2, 3, TileType.Lava);
    engineState.deltaTime = 0.1;
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

    player.update();

    expect(player.position).toEqual({ x: 8, y: 16 });
  });

  it('should step toward the lava once the hesitation pause elapses while the key is held', () => {
    tileMap.setTile(2, 3, TileType.Lava);
    engineState.deltaTime = 0.1;
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

    player.update();
    player.update();
    expect(player.position.x).toBe(8);

    player.update();
    expect(player.position.x).toBeGreaterThan(8);
  });

  it('should stay put if the key is released and never pressed again before the pause elapses', () => {
    tileMap.setTile(2, 3, TileType.Lava);
    engineState.deltaTime = 0.1;
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

    player.update();

    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowRight' }));
    player.update();
    keyboard.next();

    player.update();

    expect(player.position).toEqual({ x: 8, y: 16 });
  });

  it('should step toward the lava if the key is released and pressed again before the pause elapses', () => {
    tileMap.setTile(2, 3, TileType.Lava);
    engineState.deltaTime = 0.1;
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

    player.update();

    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowRight' }));
    player.update();
    keyboard.next();
    expect(player.position.x).toBe(8);

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
    player.update();

    expect(player.position.x).toBeGreaterThan(8);
  });

  it('should skip the hesitation pause the next time the player moves in the same direction after already being warned', () => {
    tileMap.setTile(2, 3, TileType.Lava);
    engineState.deltaTime = 0.1;
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

    player.update();

    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowRight' }));
    player.update();
    keyboard.next();

    player.update();
    expect(player.position).toEqual({ x: 8, y: 16 });

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
    player.update();

    expect(player.position.x).toBeGreaterThan(8);
  });

  it('should require hesitating again after moving in a different direction clears the skip', () => {
    tileMap.setTile(2, 3, TileType.Lava);
    tileMap.setTile(0, 3, TileType.Brick);
    engineState.deltaTime = 0.1;
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

    player.update();

    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowRight' }));
    player.update();
    keyboard.next();

    player.update();
    expect(player.position).toEqual({ x: 8, y: 16 });

    engineState.deltaTime = 1;
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
    player.update();
    expect(player.position).toEqual({ x: 0, y: 16 });

    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowLeft' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
    player.update();
    keyboard.next();
    expect(player.position.x).toBe(8);

    engineState.deltaTime = 0.1;
    player.update();
    expect(player.position.x).toBe(8);
  });

  it('should fall when there is no brick below, regardless of input', () => {
    teleportPlayer(player, 12, 2);

    player.update();

    expect(player.position.y).toBeGreaterThan(16);
  });

  it('should clamp horizontal movement so the player never leaves the screen', () => {
    for (let column = 0; column < tileMap.columns; column++) {
      tileMap.setTile(column, 3, TileType.Brick);
    }
    teleportPlayer(player, tileMap.columns - 1, 2);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

    player.update();

    expect(player.position.x).toBe(SCREEN_WIDTH - CELL_SIZE);
  });

  it('should clamp falling so the player never drops below the screen', () => {
    teleportPlayer(player, 12, tileMap.rows - 1);

    player.update();

    expect(player.position.y).toBe(SCREEN_HEIGHT - CELL_SIZE);
  });

  it('should finish the current 8px step even if the key is released mid-step', () => {
    tileMap.setTile(2, 3, TileType.Brick);
    engineState.deltaTime = 0.05;
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

    player.update();

    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowRight' }));
    player.update();
    keyboard.next();

    player.update();
    expect(player.position.x).toBeLessThan(16);

    player.update();
    expect(player.position.x).toBe(16);

    player.update();
    expect(player.position.x).toBe(16);
  });

  it('should ignore a direction change until the in-progress step completes', () => {
    tileMap.setTile(2, 3, TileType.Brick);
    engineState.deltaTime = 0.05;
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

    player.update();

    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowRight' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
    player.update();
    keyboard.next();

    player.update();
    player.update();
    expect(player.position.x).toBe(16);

    player.update();
    expect(player.position.x).toBeLessThan(16);
  });

  it('should commit to a full 8px fall before re-evaluating whether the player has landed', () => {
    teleportPlayer(player, 12, 2);
    engineState.deltaTime = 0.05;

    player.update();
    player.update();
    expect(player.position.y).toBeLessThan(24);

    player.update();
    expect(player.position.y).toBe(24);
  });

  it('should stay in place on a stairs tile even without ground below, when no key is pressed', () => {
    teleportPlayer(player, 4, 2);
    tileMap.setTile(4, 2, TileType.Stairs);

    player.update();

    expect(player.position).toEqual({ x: 32, y: 16 });
  });

  it('should still allow climbing while on a stairs tile with no ground below', () => {
    teleportPlayer(player, 4, 2);
    tileMap.setTile(4, 2, TileType.Stairs);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));

    player.update();

    expect(player.position.x).toBe(32);
    expect(player.position.y).toBeLessThan(16);
  });

  it('should keep climbing when the next cell up is also a stairs tile', () => {
    teleportPlayer(player, 4, 2);
    tileMap.setTile(4, 2, TileType.Stairs);
    tileMap.setTile(4, 1, TileType.Stairs);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));

    player.update();

    expect(player.position.x).toBe(32);
    expect(player.position.y).toBeLessThan(16);
  });

  it('should stay in place on a crossbar tile even without ground below, when no key is pressed', () => {
    teleportPlayer(player, 4, 2);
    tileMap.setTile(4, 2, TileType.Crossbar);

    player.update();

    expect(player.position).toEqual({ x: 32, y: 16 });
  });

  it('should stop falling once it reaches a crossbar tile', () => {
    teleportPlayer(player, 12, 2);
    tileMap.setTile(12, 3, TileType.Crossbar);
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
    teleportPlayer(player, 4, 2);
    tileMap.setTile(4, 2, TileType.Crossbar);
    tileMap.setTile(3, 2, TileType.Crossbar);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));

    player.update();

    expect(player.position.x).toBeLessThan(32);
    expect(player.position.y).toBe(16);
  });

  it('should move right along a crossbar', () => {
    teleportPlayer(player, 4, 2);
    tileMap.setTile(4, 2, TileType.Crossbar);
    tileMap.setTile(5, 2, TileType.Crossbar);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

    player.update();

    expect(player.position.x).toBeGreaterThan(32);
    expect(player.position.y).toBe(16);
  });

  it('should not move along a crossbar when a brick blocks the target cell', () => {
    teleportPlayer(player, 4, 2);
    tileMap.setTile(4, 2, TileType.Crossbar);
    tileMap.setTile(3, 2, TileType.Brick);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));

    player.update();

    expect(player.position).toEqual({ x: 32, y: 16 });
  });

  it('should ignore the up arrow while grounded on a non-stairs tile', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));

    player.update();

    expect(player.position).toEqual({ x: 8, y: 16 });
  });

  it('should transition to Dying and freeze in place when standing on a dangerous tile', () => {
    teleportPlayer(player, 5, 2);
    tileMap.setTile(5, 2, TileType.Lava);

    player.update();

    expect(player.position).toEqual({ x: 40, y: 16 });
  });

  it('should ignore movement input while dying', () => {
    engineState.deltaTime = 0.3;
    teleportPlayer(player, 5, 2);
    tileMap.setTile(5, 2, TileType.Lava);

    player.update();

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
    player.update();

    expect(player.position).toEqual({ x: 40, y: 16 });
  });

  it('should respawn at the spawn position and lose a life once the dying timer elapses', () => {
    teleportPlayer(player, 5, 2);
    tileMap.setTile(5, 2, TileType.Lava);

    player.update();
    expect(livesScript.count).toBe(2);

    player.update();

    expect(player.position).toEqual({ x: 8, y: 16 });
    expect(livesScript.count).toBe(1);
  });

  it('should transition to GameOver instead of respawning once lives reach zero, and stop responding to input', () => {
    livesScript.loseLife();
    teleportPlayer(player, 5, 2);
    tileMap.setTile(5, 2, TileType.Lava);

    player.update();
    player.update();

    expect(livesScript.isGameOver).toBe(true);
    expect(player.position).toEqual({ x: 40, y: 16 });

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
    player.update();

    expect(player.position).toEqual({ x: 40, y: 16 });
  });
});
