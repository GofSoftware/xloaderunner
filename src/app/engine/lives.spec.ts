import { Lives, MAX_LIVES } from './lives';

describe('Lives', () => {
  it('should start at the given count', () => {
    expect(Lives.create(3).count).toBe(3);
  });

  it('should default to MAX_LIVES when no count is given', () => {
    expect(Lives.create().count).toBe(MAX_LIVES);
  });

  it('should decrement the count when a life is lost', () => {
    const lives = Lives.create(2);

    lives.loseLife();

    expect(lives.count).toBe(1);
  });

  it('should report game over once the count reaches zero', () => {
    const lives = Lives.create(1);

    expect(lives.isGameOver).toBe(false);

    lives.loseLife();

    expect(lives.count).toBe(0);
    expect(lives.isGameOver).toBe(true);
  });

  it('should not go negative when losing a life after game over', () => {
    const lives = Lives.create(1);

    lives.loseLife();
    lives.loseLife();

    expect(lives.count).toBe(0);
    expect(lives.isGameOver).toBe(true);
  });
});
