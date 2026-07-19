import { Service, signal } from '@angular/core';
import { ScreenHelper } from './screen.helper';

@Service()
export class ScreenBuffer {
  private buffer: number[][] = ScreenHelper.defaultPixels();
  private updateCount = 0;

  readonly pixels = signal<number[][]>(this.buffer);

  startUpdate(): void {
    this.updateCount++;
  }

  copy(source: number[][], x: number, y: number): void {
    if (this.updateCount <= 0) {
      throw new Error('ScreenBuffer.copy() was called before startUpdate()');
    }
    this.buffer = ScreenHelper.copy(this.buffer, source, x, y);
  }

  stopUpdate(): void {
    if (this.updateCount === 0) {
      return;
    }

    this.updateCount--;
    if (this.updateCount === 0) {
      this.pixels.set(this.buffer);
    }
  }
}
