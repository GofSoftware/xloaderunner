import { vi } from 'vitest';
import { Engine } from './engine';
import { GameObject } from './game-object/game-object';
import { Script } from './game-object/script';
import { ILevel } from './i-level';

class NoopLevel implements ILevel {
  public async initialize(): Promise<void> {}
  public onMoseMove(): void {}
}

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

class StartRecordingScript extends Script {
  constructor(
    gameObject: GameObject,
    private readonly started: string[],
  ) {
    super(gameObject);
  }

  public override start(): void {
    this.started.push(this.gameObject.name);
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

  beforeEach(async () => {
    log = [];
    vi.useFakeTimers();
    await Engine.instance.start(new NoopLevel());
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

    it('should start the game object, so callers never have to start() it themselves', () => {
      const started: string[] = [];
      const gameObject = GameObject.create('D', Engine.instance, { x: 0, y: 0 }, [(go) => new StartRecordingScript(go, started)]);

      Engine.instance.addGameObject(gameObject);

      expect(started).toEqual(['D']);
      expect(gameObject.isStarted).toBe(true);
    });

    it('should not start a game object a second time if it was already started', () => {
      const started: string[] = [];
      const gameObject = GameObject.create('E', Engine.instance, { x: 0, y: 0 }, [(go) => new StartRecordingScript(go, started)]);
      gameObject.start();

      Engine.instance.addGameObject(gameObject);

      expect(started).toEqual(['E']);
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

    it('should destroy an untracked game object without throwing, even though there is nothing to untrack', () => {
      const destroyed: string[] = [];
      const untracked = GameObject.create('Untracked', Engine.instance, { x: 0, y: 0 }, [
        (go) => new DestroyRecordingScript(go, destroyed),
      ]);

      expect(() => Engine.instance.removeGameObject(untracked)).not.toThrow();
      expect(destroyed).toEqual(['Untracked']);
    });

    it('should destroy the game object, so callers never have to destroy() it themselves', () => {
      const destroyed: string[] = [];
      const gameObject = GameObject.create('F', Engine.instance, { x: 0, y: 0 }, [(go) => new DestroyRecordingScript(go, destroyed)]);
      Engine.instance.addGameObject(gameObject);

      Engine.instance.removeGameObject(gameObject);

      expect(destroyed).toEqual(['F']);
      expect(gameObject.isDestroyed).toBe(true);
    });

    it('should not destroy a game object again if it was already destroyed', () => {
      const destroyed: string[] = [];
      const gameObject = GameObject.create('G', Engine.instance, { x: 0, y: 0 }, [(go) => new DestroyRecordingScript(go, destroyed)]);
      Engine.instance.addGameObject(gameObject);
      gameObject.destroy();

      Engine.instance.removeGameObject(gameObject);

      expect(destroyed).toEqual(['G']);
    });

    it('should stay tracked after destroy() is called directly - only removeGameObject() untracks it', () => {
      const gameObject = createRecorder('DirectlyDestroyed');
      Engine.instance.addGameObject(gameObject);

      gameObject.destroy();

      expect(Engine.instance.getGameObjectByName('DirectlyDestroyed')).toBe(gameObject);
    });
  });

  describe('getGameObjectByName', () => {
    it('should find a tracked game object by name', () => {
      const a = createRecorder('Findable');
      Engine.instance.addGameObject(a);

      expect(Engine.instance.getGameObjectByName('Findable')).toBe(a);
    });

    it('should return undefined for a name that is not tracked', () => {
      expect(Engine.instance.getGameObjectByName('Nope')).toBeUndefined();
    });

    it('should return the first-added game object when multiple share a name', () => {
      const first = createRecorder('Duplicate');
      const second = createRecorder('Duplicate');
      Engine.instance.addGameObject(first);
      Engine.instance.addGameObject(second);

      expect(Engine.instance.getGameObjectByName('Duplicate')).toBe(first);
    });

    it('should stop finding a game object once it is removed', () => {
      const a = createRecorder('Removable');
      Engine.instance.addGameObject(a);

      Engine.instance.removeGameObject(a);

      expect(Engine.instance.getGameObjectByName('Removable')).toBeUndefined();
    });

    it('should fall back to the next same-named game object once the first is removed', () => {
      const first = createRecorder('Duplicate');
      const second = createRecorder('Duplicate');
      Engine.instance.addGameObject(first);
      Engine.instance.addGameObject(second);

      Engine.instance.removeGameObject(first);

      expect(Engine.instance.getGameObjectByName('Duplicate')).toBe(second);
    });
  });

  describe('stop', () => {
    it('should destroy every tracked game object, not skip every other one as the array shrinks', () => {
      const destroyed: string[] = [];
      const names = ['A', 'B', 'C', 'D', 'E'];
      names.forEach((name) => {
        const gameObject = GameObject.create(name, Engine.instance, { x: 0, y: 0 }, [(go) => new DestroyRecordingScript(go, destroyed)]);
        Engine.instance.addGameObject(gameObject);
      });

      Engine.instance.stop();

      names.forEach((name) => expect(destroyed).toContain(name));
      expect(destroyed.length).toBe(new Set(destroyed).size);
    });
  });
});
