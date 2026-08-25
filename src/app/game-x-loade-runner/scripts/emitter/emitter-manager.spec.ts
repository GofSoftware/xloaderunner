import { EmitterManager } from './emitter-manager';
import { EmitterScript } from './emitter-script';
import { EmitterColor } from './emitter-color';
import { Direction, StateScript } from '../state-script';
import { TileMap, TileType } from '../tile-map';
import { ObjectPosition } from '../../../engine/scripts/object-position';
import { GameObject } from '../../../engine/game-object/game-object';
import { ScreenBuffer } from '../../../engine/screen/screen-buffer';
import { CELL_SIZE, LAYER_COUNT, UPPER_EFFECT_LAYER } from '../../../engine/screen/screen.constants';
import { IEngineState } from '../../../engine/i-engine-state';

const GREEN = 0x00ff00ff;
const BLUE = 0x0000ffff;
// Mirrors EmitterManager's own STEPS_PER_SEC (50) - the beam only advances one cell every 20ms of
// engineState.timeFromStart, regardless of how many render frames happen in between.
const STEP_MS = 20;

describe('EmitterManager', () => {
  let engineState: IEngineState;
  let tileMap: TileMap;
  let emittersGameObject: GameObject;
  let gameObjectsByName: Map<string, GameObject>;
  // Mirrors Engine.gameObjects: every GameObject added via engineState.addGameObject(), in order -
  // needed so a rendered frame can call update() on the beam segments EmitterManager creates, the
  // same way Engine's own render loop would.
  let renderedGameObjects: GameObject[];

  // The beam bitmaps only ever mark part of the cell, and which part depends on orientation/animation
  // frame - scan the whole cell instead of assuming one exact coordinate, so assertions don't depend
  // on those details.
  function pixelAt(column: number, row: number, layer: number = UPPER_EFFECT_LAYER): number {
    for (let dy = 0; dy < CELL_SIZE; dy++) {
      for (let dx = 0; dx < CELL_SIZE; dx++) {
        const pixel = engineState.screenBuffer.buffers[layer][row * CELL_SIZE + dy][column * CELL_SIZE + dx];
        if (pixel !== 0) {
          return pixel;
        }
      }
    }
    return 0;
  }

  function isBlank(column: number, row: number, layer: number = UPPER_EFFECT_LAYER): boolean {
    return pixelAt(column, row, layer) === 0;
  }

  // Mirrors Engine.render(): clear the buffer, then update() a snapshot of every tracked GameObject.
  function renderFrame(): void {
    engineState.screenBuffer.clear();
    [...renderedGameObjects].forEach((gameObject) => gameObject.update());
  }

  // Advances engineState.timeFromStart one full step (100ms) at a time, rendering a frame after each -
  // one step per render keeps every segment's move+redraw inside its own cleared buffer, so nothing
  // from an intermediate position (passed through earlier within a single jump) lingers as a ghost
  // pixel. EmitterManager processes at most one step per call this way, matching real gameplay where
  // steps happen roughly one per render at a normal frame rate.
  function advanceSteps(count: number): void {
    for (let i = 0; i < count; i++) {
      engineState.timeFromStart += STEP_MS;
      renderFrame();
    }
  }

  function createEmitter(column: number, row: number, color: EmitterColor, direction: Direction): GameObject {
    const name = `Emitter-${column}-${row}`;
    const gameObject = GameObject.create(name, engineState, { x: column * CELL_SIZE, y: row * CELL_SIZE }, [
      (go) => ObjectPosition.create(go, column, row),
      (go) => EmitterScript.create(go, color, direction),
    ]);
    gameObject.start();
    gameObjectsByName.set(name, gameObject);
    return gameObject;
  }

  function createCharacter(name: string, column: number, row: number): GameObject {
    const gameObject = GameObject.create(name, engineState, { x: column * CELL_SIZE, y: row * CELL_SIZE }, [
      (go) => StateScript.create(go, { column, row }),
      (go) => ObjectPosition.create(go, column, row),
    ]);
    gameObject.start();
    gameObjectsByName.set(name, gameObject);
    return gameObject;
  }

  beforeEach(() => {
    gameObjectsByName = new Map<string, GameObject>();
    renderedGameObjects = [];
    engineState = {
      screenBuffer: ScreenBuffer.create(LAYER_COUNT),
      deltaTime: 1,
      timeFromStart: 0,
      startedAt: 0,
      addGameObject: (gameObject: GameObject) => {
        gameObjectsByName.set(gameObject.name, gameObject);
        renderedGameObjects.push(gameObject);
        gameObject.start();
      },
      removeGameObject: (gameObject: GameObject) => {
        gameObjectsByName.delete(gameObject.name);
        const index = renderedGameObjects.indexOf(gameObject);
        if (index >= 0) {
          renderedGameObjects.splice(index, 1);
        }
        if (!gameObject.isDestroyed) {
          gameObject.destroy();
        }
      },
      getGameObjectByName: (name: string) => gameObjectsByName.get(name),
    } as unknown as IEngineState;

    const mapGameObject = GameObject.create('Map', engineState, { x: 0, y: 0 }, [(go) => TileMap.create(go)]);
    tileMap = mapGameObject.getScript(TileMap)!;
    gameObjectsByName.set('Map', mapGameObject);

    emittersGameObject = GameObject.create('Emitters', engineState, { x: 0, y: 0 }, [(go) => EmitterManager.create(go)]);
    engineState.addGameObject(emittersGameObject);
  });

  it('draws nothing before the first step is due', () => {
    createEmitter(2, 5, EmitterColor.Green, Direction.Right);

    renderFrame();

    expect(isBlank(3, 5)).toBe(true);
  });

  it('grows the beam outward one cell per step, starting one cell past the emitter', () => {
    createEmitter(2, 5, EmitterColor.Green, Direction.Right);

    advanceSteps(1);
    expect(pixelAt(3, 5)).toBe(GREEN);
    expect(isBlank(4, 5)).toBe(true);

    advanceSteps(1);
    expect(pixelAt(3, 5)).toBe(GREEN);
    expect(pixelAt(4, 5)).toBe(GREEN);
    expect(isBlank(5, 5)).toBe(true);

    advanceSteps(1);
    expect(pixelAt(3, 5)).toBe(GREEN);
    expect(pixelAt(4, 5)).toBe(GREEN);
    expect(pixelAt(5, 5)).toBe(GREEN);
    expect(isBlank(2, 5)).toBe(true);
  });

  it('reaches a stable length once it hits a wall, and never draws on or past it', () => {
    createEmitter(2, 5, EmitterColor.Green, Direction.Right);
    tileMap.setTile(6, 5, TileType.Brick);

    advanceSteps(8);

    expect(pixelAt(3, 5)).toBe(GREEN);
    expect(pixelAt(4, 5)).toBe(GREEN);
    expect(pixelAt(5, 5)).toBe(GREEN);
    expect(isBlank(6, 5)).toBe(true);
    expect(isBlank(7, 5)).toBe(true);
  });

  it('stops at lava the same way', () => {
    createEmitter(2, 5, EmitterColor.Green, Direction.Right);
    tileMap.setTile(6, 5, TileType.Lava);

    advanceSteps(8);

    expect(pixelAt(5, 5)).toBe(GREEN);
    expect(isBlank(6, 5)).toBe(true);
  });

  it('stops at the player, without drawing on the player cell', () => {
    createEmitter(2, 5, EmitterColor.Green, Direction.Right);
    createCharacter('Player', 6, 5);

    advanceSteps(8);

    expect(pixelAt(5, 5)).toBe(GREEN);
    expect(isBlank(6, 5)).toBe(true);
  });

  it('stops at an enemy the same way', () => {
    createEmitter(2, 5, EmitterColor.Blue, Direction.Right);
    createCharacter('Enemy', 6, 5);

    advanceSteps(8);

    expect(pixelAt(5, 5)).toBe(BLUE);
    expect(isBlank(6, 5)).toBe(true);
  });

  it('recalculates as the map changes - a wall placed in its path blocks everything spawned afterward', () => {
    createEmitter(2, 5, EmitterColor.Green, Direction.Right);
    advanceSteps(1);
    expect(pixelAt(3, 5)).toBe(GREEN);

    // Placed one cell ahead of the beam's current tip, so every future step is affected - no segment
    // that's already past this cell to still be in flight and grandfathered through.
    tileMap.setTile(4, 5, TileType.Brick);
    advanceSteps(5);

    expect(pixelAt(3, 5)).toBe(GREEN);
    expect(isBlank(4, 5)).toBe(true);
    expect(isBlank(5, 5)).toBe(true);
  });

  it('bends through a BeamRotator tile instead of continuing straight', () => {
    createEmitter(2, 5, EmitterColor.Green, Direction.Right);
    tileMap.setTile(5, 5, TileType.BeamRotator);

    advanceSteps(8);

    // The horizontal leg up to and including the rotator cell.
    expect(pixelAt(3, 5)).toBe(GREEN);
    expect(pixelAt(4, 5)).toBe(GREEN);
    expect(pixelAt(5, 5)).toBe(GREEN);
    // It turns onto a vertical leg (Direction.Down) instead of continuing right.
    expect(pixelAt(5, 6)).toBe(GREEN);
    expect(pixelAt(5, 7)).toBe(GREEN);
    expect(isBlank(6, 5)).toBe(true);
  });

  it('stops registering a removed emitter', () => {
    const emitter = createEmitter(2, 5, EmitterColor.Green, Direction.Right);
    emitter.destroy();

    advanceSteps(8);

    expect(isBlank(3, 5)).toBe(true);
  });

  describe('beam collisions', () => {
    it('goes invisible where two beams cross, and stays invisible past that point for both', () => {
      // Green travels right along row 5 from column 2; Blue travels left along row 5 from column 10 -
      // they meet at column 6.
      createEmitter(2, 5, EmitterColor.Green, Direction.Right);
      createEmitter(10, 5, EmitterColor.Blue, Direction.Left);

      advanceSteps(10);

      expect(pixelAt(4, 5)).toBe(GREEN);
      expect(pixelAt(5, 5)).toBe(GREEN);
      expect(pixelAt(8, 5)).toBe(BLUE);
      expect(pixelAt(7, 5)).toBe(BLUE);
      expect(isBlank(6, 5)).toBe(true);
    });

    it('handles more than one collision point at once, independently', () => {
      // A separate crossing on row 5 (columns 2/10 meeting at 6) and another on row 15 (columns 2/8
      // meeting at 5) - each pair's beam should go dark at its own crossing, unaffected by the other.
      createEmitter(2, 5, EmitterColor.Green, Direction.Right);
      createEmitter(10, 5, EmitterColor.Blue, Direction.Left);
      createEmitter(2, 15, EmitterColor.Green, Direction.Right);
      createEmitter(8, 15, EmitterColor.Blue, Direction.Left);

      advanceSteps(10);

      expect(pixelAt(4, 5)).toBe(GREEN);
      expect(pixelAt(8, 5)).toBe(BLUE);
      expect(isBlank(6, 5)).toBe(true);

      expect(pixelAt(4, 15)).toBe(GREEN);
      expect(pixelAt(6, 15)).toBe(BLUE);
      expect(isBlank(5, 15)).toBe(true);
    });
  });
});
