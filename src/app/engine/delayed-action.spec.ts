import { vi } from 'vitest';
import { DelayedAction } from './delayed-action';

describe('DelayedAction', () => {
  it('should not fire before the duration has elapsed', () => {
    const action = vi.fn();
    const delayed = DelayedAction.create(1, action);

    delayed.advance(0.5);

    expect(action).not.toHaveBeenCalled();
    expect(delayed.isPending).toBe(true);
  });

  it('should fire exactly once elapsed time reaches the duration', () => {
    const action = vi.fn();
    const delayed = DelayedAction.create(1, action);

    delayed.advance(0.6);
    delayed.advance(0.4);

    expect(action).toHaveBeenCalledTimes(1);
    expect(delayed.isPending).toBe(false);
  });

  it('should not fire again on later advance() calls once it has already fired', () => {
    const action = vi.fn();
    const delayed = DelayedAction.create(1, action);

    delayed.advance(2);
    delayed.advance(2);
    delayed.advance(2);

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('should accumulate elapsed time across multiple advance() calls', () => {
    const action = vi.fn();
    const delayed = DelayedAction.create(1, action);

    delayed.advance(0.3);
    delayed.advance(0.3);
    expect(action).not.toHaveBeenCalled();

    delayed.advance(0.3);
    expect(action).not.toHaveBeenCalled();

    delayed.advance(0.3);
    expect(action).toHaveBeenCalledTimes(1);
  });
});
