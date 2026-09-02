import { EmitterScript } from './emitter-script';
import { EmitterColor } from './emitter-color';
import { EmitterManager } from './emitter-manager';
import { Direction } from '../state/state-types';
import { ObjectPosition } from '../object-position';
import { GameObject } from '../../../engine/game-object/game-object';
import { IEngineState } from '../../../engine/i-engine-state';

describe('EmitterScript', () => {
  function createEngineState(manager?: EmitterManager): IEngineState {
    const emittersGameObject = manager ? ({ getScript: () => manager } as unknown as GameObject) : undefined;
    return {
      getGameObjectByName: (name: string) => (name === 'Emitters' ? emittersGameObject : undefined),
      addGameObject: () => {},
      removeGameObject: () => {},
    } as unknown as IEngineState;
  }

  function createEmitterTile(
    engineState: IEngineState,
    column: number,
    row: number,
    color: EmitterColor,
    direction: Direction,
  ): GameObject {
    return GameObject.create('Emitter', engineState, { x: column * 8, y: row * 8 }, [
      (go) => ObjectPosition.create(go, column, row),
      (go) => EmitterScript.create(go, color, direction),
    ]);
  }

  it('exposes its color, direction, and cell', () => {
    const gameObject = createEmitterTile(createEngineState(), 5, 6, EmitterColor.Blue, Direction.Up);
    gameObject.start();

    const emitter = gameObject.getScript(EmitterScript)!;
    expect(emitter.color).toBe(EmitterColor.Blue);
    expect(emitter.direction).toBe(Direction.Up);
    expect(emitter.column).toBe(5);
    expect(emitter.row).toBe(6);
  });

  it('registers itself with the EmitterManager on start', () => {
    const manager = { register: vi.fn(), unregister: vi.fn() } as unknown as EmitterManager;
    const gameObject = createEmitterTile(createEngineState(manager), 1, 1, EmitterColor.Green, Direction.Right);

    gameObject.start();

    expect(manager.register).toHaveBeenCalledWith(gameObject.getScript(EmitterScript));
  });

  it('unregisters itself from the EmitterManager on destroy', () => {
    const manager = { register: vi.fn(), unregister: vi.fn() } as unknown as EmitterManager;
    const gameObject = createEmitterTile(createEngineState(manager), 1, 1, EmitterColor.Green, Direction.Right);
    gameObject.start();

    gameObject.destroy();

    expect(manager.unregister).toHaveBeenCalledWith(gameObject.getScript(EmitterScript));
  });

  it('does not throw when no EmitterManager is registered under "Emitters"', () => {
    const gameObject = createEmitterTile(createEngineState(), 1, 1, EmitterColor.Green, Direction.Right);

    expect(() => gameObject.start()).not.toThrow();
    expect(() => gameObject.destroy()).not.toThrow();
  });
});
