import { StateScript } from './state-script';
import { Direction } from './state/state-types';
import { TileMap } from './tile-map/tile-map';
import { TileType } from './tile-map/tile-map-types';
import { BitmapSpriteRenderer } from '../../engine/scripts/renderer/bitmap-sprite-renderer';
import { KeyboardInputScript } from '../../engine/scripts/keyboard-input-script';
import { ObjectPosition } from './object-position';
import { MapHelper } from '../helpers/map.helper';
import { GameObject } from '../../engine/game-object/game-object';
import { Keyboard } from '../../engine/keyboard/keyboard';
import { ScreenBuffer } from '../../engine/screen/screen-buffer';
import { CELL_SIZE, FOREGROUND_LAYER, LAYER_COUNT, SCREEN_HEIGHT, SCREEN_WIDTH } from '../../engine/screen/screen.constants';
import { IEngineState } from '../../engine/i-engine-state';
import { MAN_MOVING_LEFT_FRAME_1 } from '../data/sprites';
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

  // A character whose StateScript is configured to get trapped in a blasted-open brick hole
  // (getsTrappedInHoles), the way Enemy is wired in engine.ts - unlike the default `player` above.
  function createTrappingCharacter(position: { x: number; y: number }): GameObject {
    const { column, row } = MapHelper.screenToMap(position.x, position.y);
    const gameObject = GameObject.create('Enemy', engineState, position, [
      (go) => StateScript.create(go, spawnCell, 1, true),
      (go) => ObjectPosition.create(go, column, row),
    ]);
    gameObject.start();
    return gameObject;
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
      timeFromStart: 0,
      startedAt: 0,
      level: {} as IEngineState['level'],
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

    // Reversing direction faces the player left right away, but - same as a fresh key tap -
    // takes a couple more frames of holding it before the turn delay elapses and it actually steps.
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

  describe('direction', () => {
    it('defaults to Right before the player has ever moved', () => {
      expect(player.getScript(StateScript)!.direction).toBe(Direction.Right);
    });

    it('faces left immediately on the very first move, with no turn delay', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));

      player.update();

      expect(player.getScript(StateScript)!.direction).toBe(Direction.Left);
      expect(player.position.x).toBeLessThan(8);
    });

    it('turns to face a new direction immediately, but only starts running after the turn delay elapses', () => {
      // Same run-right-then-reverse sequence as 'should ignore a direction change until the
      // in-progress step completes' above - see that test for the frame-by-frame trace.
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
      expect(player.getScript(StateScript)!.direction).toBe(Direction.Left);
      expect(player.position.x).toBe(16);

      player.update();
      expect(player.position.x).toBeLessThan(16);
    });

    it('never pauses while continuing to hold the same direction', () => {
      tileMap.setTile(2, 3, TileType.Brick);
      engineState.deltaTime = 0.05;
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

      player.update();
      player.update();
      player.update();

      expect(player.position.x).toBeGreaterThan(8);
    });

    it('turns to face up even while grounded on a non-stairs tile, where climbing is impossible', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));

      player.update();

      expect(player.getScript(StateScript)!.direction).toBe(Direction.Up);
      expect(player.position).toEqual({ x: 8, y: 16 });
    });

    it('turns to face right even when a brick blocks the step', () => {
      tileMap.setTile(2, 2, TileType.Brick);
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

      player.update();

      expect(player.getScript(StateScript)!.direction).toBe(Direction.Right);
      expect(player.position).toEqual({ x: 8, y: 16 });
    });

    it('turns to face up even when a brick blocks the step above, while on stairs', () => {
      teleportPlayer(player, 4, 2);
      tileMap.setTile(4, 2, TileType.Stairs);
      tileMap.setTile(4, 1, TileType.Brick);
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));

      player.update();

      expect(player.getScript(StateScript)!.direction).toBe(Direction.Up);
      expect(player.position).toEqual({ x: 32, y: 16 });
    });

    it('lets a released key be re-affirmed in the same direction without paying the turn delay again', () => {
      tileMap.setTile(2, 3, TileType.Brick);
      engineState.deltaTime = 0.05;
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
      player.update();
      player.update();
      player.update();
      player.update();
      expect(player.position.x).toBe(16);

      window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowRight' }));
      player.update();
      keyboard.next();
      expect(player.position.x).toBe(16);

      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
      player.update();

      expect(player.position.x).toBeGreaterThan(16);
    });
  });

  describe('blasted brick holes', () => {
    it('keeps falling straight through a blasted-open brick by default (getsTrappedInHoles is off)', () => {
      teleportPlayer(player, 12, 2);
      tileMap.setTile(12, 3, TileType.BlastedBrick);
      engineState.deltaTime = 0.05;

      player.update();
      player.update();
      player.update();
      expect(player.position.y).toBe(24);

      // Nothing solid below the hole either, so a non-trapping character just keeps falling past it.
      player.update();
      expect(player.position.y).toBeGreaterThan(24);
    });

    it('pins a trapping character in place once it drops onto a blasted-open brick, instead of falling further', () => {
      const enemy = createTrappingCharacter({ x: 96, y: 16 });
      tileMap.setTile(12, 3, TileType.BlastedBrick);
      engineState.deltaTime = 0.05;

      enemy.update();
      enemy.update();
      enemy.update();
      expect(enemy.position.y).toBe(24);

      enemy.update();
      enemy.update();
      expect(enemy.position.y).toBe(24);
    });

    it('lets a trapping character stand on top of a blasted-open brick once something occupies it', () => {
      const enemy = createTrappingCharacter({ x: 96, y: 8 });
      tileMap.setTile(12, 2, TileType.BlastedBrick);
      const occupant = GameObject.create('TrappedEnemy', engineState, { x: 96, y: 16 }, [(go) => ObjectPosition.create(go, 12, 2)]);
      occupant.start();

      enemy.update();

      expect(enemy.position).toEqual({ x: 96, y: 8 });
    });

    it('falls into an unoccupied blasted-open brick rather than treating it as solid ground', () => {
      teleportPlayer(player, 12, 2);
      tileMap.setTile(12, 3, TileType.BlastedBrick);

      player.update();

      expect(player.position.y).toBeGreaterThan(16);
    });
  });
});
