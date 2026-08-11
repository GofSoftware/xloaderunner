import { vi } from 'vitest';
import { GameObject } from './game-object';
import { Script } from './script';
import { IEngineState } from '../i-engine-state';

class FirstScript extends Script {
  constructor(gameObject: GameObject) {
    super(gameObject);
  }
}
class SecondScript extends Script {
  constructor(gameObject: GameObject) {
    super(gameObject);
  }
}

class StartRecordingScript extends Script {
  public startCount = 0;

  constructor(gameObject: GameObject) {
    super(gameObject);
  }

  public override start(): void {
    this.startCount++;
  }
}

class DestroyRecordingScript extends Script {
  public destroyCount = 0;

  constructor(gameObject: GameObject) {
    super(gameObject);
  }

  public override destroy(): void {
    this.destroyCount++;
  }
}

describe('GameObject', () => {
  describe('getScript', () => {
    it('should find an attached script by its class', () => {
      const gameObject = GameObject.create('Test', {} as IEngineState, { x: 0, y: 0 }, [
        (go) => new FirstScript(go),
        (go) => new SecondScript(go),
      ]);

      expect(gameObject.getScript(FirstScript)).toBeInstanceOf(FirstScript);
      expect(gameObject.getScript(SecondScript)).toBeInstanceOf(SecondScript);
    });

    it('should return undefined when no script of that class is attached', () => {
      const gameObject = GameObject.create('Test', {} as IEngineState, { x: 0, y: 0 }, [(go) => new FirstScript(go)]);

      expect(gameObject.getScript(SecondScript)).toBeUndefined();
    });
  });

  describe('start', () => {
    it('should mark the game object as started and start every attached script', () => {
      const gameObject = GameObject.create('Test', {} as IEngineState, { x: 0, y: 0 }, [(go) => new StartRecordingScript(go)]);

      expect(gameObject.isStarted).toBe(false);
      gameObject.start();

      expect(gameObject.isStarted).toBe(true);
      expect(gameObject.getScript(StartRecordingScript)!.startCount).toBe(1);
    });

    it('should be a no-op on subsequent calls, so callers never double-start a game object', () => {
      const gameObject = GameObject.create('Test', {} as IEngineState, { x: 0, y: 0 }, [(go) => new StartRecordingScript(go)]);

      gameObject.start();
      gameObject.start();
      gameObject.start();

      expect(gameObject.getScript(StartRecordingScript)!.startCount).toBe(1);
    });
  });

  describe('destroy', () => {
    it('should mark the game object as destroyed and destroy every attached script', () => {
      const gameObject = GameObject.create('Test', {} as IEngineState, { x: 0, y: 0 }, [(go) => new DestroyRecordingScript(go)]);

      expect(gameObject.isDestroyed).toBe(false);
      gameObject.destroy();

      expect(gameObject.isDestroyed).toBe(true);
      expect(gameObject.getScript(DestroyRecordingScript)!.destroyCount).toBe(1);
    });

    it('should be a no-op on subsequent calls, so callers never double-destroy a game object', () => {
      const gameObject = GameObject.create('Test', {} as IEngineState, { x: 0, y: 0 }, [(go) => new DestroyRecordingScript(go)]);

      gameObject.destroy();
      gameObject.destroy();
      gameObject.destroy();

      expect(gameObject.getScript(DestroyRecordingScript)!.destroyCount).toBe(1);
    });

    // Engine.removeGameObject() is the one place that untracks a game object and calls destroy() on it -
    // destroy() itself must stay silent on the engine side, or the two would recurse into each other.
    it("should not call back into the engine - untracking is Engine.removeGameObject()'s job, not destroy()'s", () => {
      const removeGameObject = vi.fn();
      const engineState = { removeGameObject } as unknown as IEngineState;
      const gameObject = GameObject.create('Test', engineState, { x: 0, y: 0 }, []);

      gameObject.destroy();

      expect(removeGameObject).not.toHaveBeenCalled();
    });
  });

  describe('setPosition', () => {
    it('should mutate the position exposed by the position getter', () => {
      const gameObject = GameObject.create('Test', {} as IEngineState, { x: 0, y: 0 }, []);

      gameObject.setPosition(5, 9);

      expect(gameObject.position).toEqual({ x: 5, y: 9 });
    });

    it('should not mutate the position object the caller passed in', () => {
      const initialPosition = { x: 0, y: 0 };
      const gameObject = GameObject.create('Test', {} as IEngineState, initialPosition, []);

      gameObject.setPosition(5, 9);

      expect(initialPosition).toEqual({ x: 0, y: 0 });
      expect(gameObject.position).toEqual({ x: 5, y: 9 });
    });
  });
});
