import { Service } from '@angular/core';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from './screen.constants';
import { ScreenHelper } from './screen.helper';

@Service()
export class ScreenBuffer {
  private buffer: number[][] = ScreenHelper.defaultPixels();
  private updateCount = 0;
  private canvas?: HTMLCanvasElement;

  /** Registers the canvas this buffer renders to, and paints the current buffer onto it. */
  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.render();
  }

  startUpdate(): void {
    this.updateCount++;
  }

  copy(source: number[][], x: number, y: number): void {
    if (this.updateCount <= 0) {
      throw new Error('ScreenBuffer.copy() was called before startUpdate()');
    }
    ScreenHelper.copy(this.buffer, source, x, y);
  }

  stopUpdate(): void {
    if (this.updateCount === 0) {
      return;
    }

    this.updateCount--;
    if (this.updateCount === 0) {
      this.render();
    }
  }

  private render(): void {
    if (!this.canvas) {
      return;
    }

    // Setting width/height (even to an unchanged value) resets the canvas
    // bitmap, wiping out whatever was just drawn. Guard so they're only
    // touched when they actually change.
    if (this.canvas.width !== SCREEN_WIDTH) {
      this.canvas.width = SCREEN_WIDTH;
    }
    if (this.canvas.height !== SCREEN_HEIGHT) {
      this.canvas.height = SCREEN_HEIGHT;
    }

    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const imageData = ctx.createImageData(SCREEN_WIDTH, SCREEN_HEIGHT);
    for (let y = 0; y < SCREEN_HEIGHT; y++) {
      const row = this.buffer[y] ?? [];
      for (let x = 0; x < SCREEN_WIDTH; x++) {
        const [r, g, b, a] = ScreenHelper.unpackRgba(row[x] ?? 0);
        const offset = (y * SCREEN_WIDTH + x) * 4;
        imageData.data[offset] = r;
        imageData.data[offset + 1] = g;
        imageData.data[offset + 2] = b;
        imageData.data[offset + 3] = a;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }
}
