import { vi } from 'vitest';
import { LivesScript } from './lives-script';
import { GameObject } from '../../engine/game-object/game-object';
import { IEngineState } from '../../engine/i-engine-state';

describe('LivesScript', () => {
  function createLives(count: number, loseLifeCallback: () => void, registerAfterUpdate: (fn: () => void) => void): LivesScript {
    const engineState = { registerAfterUpdate } as unknown as IEngineState;
    const gameObject = GameObject.create('Lives', engineState, { x: 0, y: 0 }, [(go) => LivesScript.create(go, count, loseLifeCallback)]);
    return gameObject.getScript(LivesScript)!;
  }

  it('should start at the given count', () => {
    const lives = createLives(
      3,
      () => {},
      () => {},
    );

    expect(lives.count).toBe(3);
  });

  // XLodeRunnerGame owns the actual life count now (it constructs a fresh LivesScript with the
  // new count on every level restart) - LivesScript itself never decrements its own count.
  it('should not change count when a life is lost', () => {
    const lives = createLives(
      2,
      () => {},
      (fn) => fn(),
    );

    lives.loseLife();

    expect(lives.count).toBe(2);
  });

  it("should defer the loseLife callback through the engine's registerAfterUpdate, not call it immediately", () => {
    const loseLifeCallback = vi.fn();
    let registeredFn: (() => void) | undefined;
    const lives = createLives(1, loseLifeCallback, (fn) => {
      registeredFn = fn;
    });

    lives.loseLife();

    expect(loseLifeCallback).not.toHaveBeenCalled();

    registeredFn!();

    expect(loseLifeCallback).toHaveBeenCalledTimes(1);
  });
});
