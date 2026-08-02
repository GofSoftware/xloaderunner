import { vi } from 'vitest';
import { Engine } from './engine';
import { GameObject } from './game-object/game-object';
import { Script } from './game-object/script';

class RecordingScript extends Script {
  constructor(
    gameObject: GameObject,
    private readonly log: string[],
  ) {
    super(gameObject);
  }

  public override update(): void {
    this.log.push(this.gameObject.name);
  }
}

class DestroyRecordingScript extends Script {
  constructor(
    gameObject: GameObject,
    private readonly destroyed: string[],
  ) {
    super(gameObject);
  }

  public override destroy(): void {
    this.destroyed.push(this.gameObject.name);
  }
}

describe('Engine', () => {
  let log: string[];

  function createRecorder(name: string): GameObject {
    return GameObject.create(name, Engine.instance, { x: 0, y: 0 }, [(gameObject) => new RecordingScript(gameObject, log)]);
  }

  function advanceOneFrame(): void {
    vi.advanceTimersByTime(0);
  }

  beforeEach(() => {
    log = [];
    vi.useFakeTimers();
    Engine.instance.start();
  });

  afterEach(() => {
    Engine.instance.stop();
    vi.useRealTimers();
  });

  describe('addGameObject', () => {
    it('should append a game object when no reference point is given', () => {
      Engine.instance.addGameObject(createRecorder('A'));

      advanceOneFrame();

      expect(log).toContain('A');
    });

    it('should insert a game object immediately after the given reference, without also appending it', () => {
      const a = createRecorder('A');
      Engine.instance.addGameObject(a);
      Engine.instance.addGameObject(createRecorder('B'), a);

      advanceOneFrame();

      const aIndex = log.indexOf('A');
      const bIndex = log.indexOf('B');
      expect(bIndex).toBe(aIndex + 1);
      expect(log.filter((name) => name === 'B').length).toBe(1);
    });

    it('should append a game object when the given reference is not currently tracked', () => {
      const untracked = createRecorder('Untracked');

      Engine.instance.addGameObject(createRecorder('C'), untracked);
      advanceOneFrame();

      expect(log).toContain('C');
      expect(log).not.toContain('Untracked');
    });
  });

  describe('removeGameObject', () => {
    it('should remove the exact instance passed, even when another game object shares its name', () => {
      const first = createRecorder('Duplicate');
      const second = createRecorder('Duplicate');
      Engine.instance.addGameObject(first);
      Engine.instance.addGameObject(second);

      Engine.instance.removeGameObject(first);
      advanceOneFrame();

      expect(log.filter((name) => name === 'Duplicate').length).toBe(1);
    });

    it('should do nothing when the game object is not currently tracked', () => {
      const untracked = createRecorder('Untracked');

      expect(() => Engine.instance.removeGameObject(untracked)).not.toThrow();
    });
  });

  describe('stop', () => {
    it('should destroy every tracked game object, not skip every other one as the array shrinks', () => {
      const destroyed: string[] = [];
      const names = ['A', 'B', 'C', 'D', 'E'];
      names.forEach((name) => {
        const gameObject = GameObject.create(name, Engine.instance, { x: 0, y: 0 }, [
          (go) => new DestroyRecordingScript(go, destroyed),
        ]);
        Engine.instance.addGameObject(gameObject);
      });

      Engine.instance.stop();

      names.forEach((name) => expect(destroyed).toContain(name));
      expect(destroyed.length).toBe(new Set(destroyed).size);
    });
  });
});
