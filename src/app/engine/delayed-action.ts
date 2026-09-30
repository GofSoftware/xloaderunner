/**
 * Runs `action` once at least `durationSeconds` worth of deltaTime has accumulated across calls to
 * `advance()`, then goes inert - further `advance()` calls do nothing. Used for one-shot,
 * elapsed-time-gated behavior (a spawn freeze, a death countdown) that would otherwise need its own
 * `{ elapsed: number } | null` field and near-identical advance/fire logic in every caller.
 */
export class DelayedAction {
  public static create(durationSeconds: number, action: () => void): DelayedAction {
    return new DelayedAction(durationSeconds, action);
  }

  private elapsed: number = 0;
  private fired: boolean = false;

  private constructor(
    private readonly durationSeconds: number,
    private readonly action: () => void,
  ) {}

  public get isPending(): boolean {
    return !this.fired;
  }

  public advance(deltaTime: number): void {
    if (this.fired) {
      return;
    }
    this.elapsed += deltaTime;
    if (this.elapsed < this.durationSeconds) {
      return;
    }
    this.fired = true;
    this.action();
  }
}
