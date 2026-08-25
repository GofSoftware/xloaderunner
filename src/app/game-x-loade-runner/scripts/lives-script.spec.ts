import { LivesScript, MAX_LIVES } from './lives-script';
import { GameObject } from '../../engine/game-object/game-object';
import { IEngineState } from '../../engine/i-engine-state';

describe('LivesScript', () => {
  function createLives(count?: number): LivesScript {
    const gameObject = GameObject.create('Lives', {} as IEngineState, { x: 0, y: 0 }, [(go) => LivesScript.create(go, count)]);
    return gameObject.getScript(LivesScript)!;
  }

  it('should start at the given count', () => {
    expect(createLives(3).count).toBe(3);
  });

  it('should default to MAX_LIVES when no count is given', () => {
    expect(createLives().count).toBe(MAX_LIVES);
  });

  it('should decrement the count when a life is lost', () => {
    const lives = createLives(2);

    lives.loseLife();

    expect(lives.count).toBe(1);
  });

  it('should report game over once the count reaches zero', () => {
    const lives = createLives(1);

    expect(lives.isGameOver).toBe(false);

    lives.loseLife();

    expect(lives.count).toBe(0);
    expect(lives.isGameOver).toBe(true);
  });

  it('should not go negative when losing a life after game over', () => {
    const lives = createLives(1);

    lives.loseLife();
    lives.loseLife();

    expect(lives.count).toBe(0);
    expect(lives.isGameOver).toBe(true);
  });
});
