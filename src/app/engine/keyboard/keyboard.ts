export class Keyboard {
  public static create(): Keyboard {
    return new Keyboard();
  }

  private readonly heldKeys = new Set<string>();
  private readonly pressedThisRound = new Set<string>();
  private readonly releasedThisRound = new Set<string>();

  private constructor() {}

  public isPressed(code: string): boolean {
    return this.heldKeys.has(code);
  }

  public wasPressedThisFrame(code: string): boolean {
    return this.pressedThisRound.has(code);
  }

  public wasReleasedThisFrame(code: string): boolean {
    return this.releasedThisRound.has(code);
  }

  public attach(): void {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  public detach(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  public next(): void {
    this.releasedThisRound.forEach((code) => this.heldKeys.delete(code));
    this.pressedThisRound.clear();
    this.releasedThisRound.clear();
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    this.heldKeys.add(event.code);
    this.pressedThisRound.add(event.code);
  };

  private readonly handleKeyUp = (event: KeyboardEvent): void => {
    this.releasedThisRound.add(event.code);
  };
}
