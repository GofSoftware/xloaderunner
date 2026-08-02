export const MAX_LIVES = 5;

export class Lives {
  public static create(count: number = MAX_LIVES): Lives {
    return new Lives(count);
  }

  private remaining: number;

  private constructor(count: number) {
    this.remaining = count;
  }

  public get count(): number {
    return this.remaining;
  }

  public get isGameOver(): boolean {
    return this.remaining <= 0;
  }

  public loseLife(): void {
    if (this.remaining > 0) {
      this.remaining--;
    }
  }
}
