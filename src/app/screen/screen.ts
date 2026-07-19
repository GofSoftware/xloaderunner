import { Component, ElementRef, computed, effect, input, viewChild } from '@angular/core';
import { DEFAULT_SCALE, SCREEN_HEIGHT, SCREEN_WIDTH } from './screen.constants';
import { ScreenHelper } from './screen.helper';

@Component({
  selector: 'app-screen',
  imports: [],
  templateUrl: './screen.html',
  styleUrl: './screen.scss',
})
export class Screen {
  readonly pixels = input<number[][]>(ScreenHelper.defaultPixels());
  readonly scale = input(DEFAULT_SCALE);

  protected readonly canvasWidth = computed(() => SCREEN_WIDTH * this.scale());
  protected readonly canvasHeight = computed(() => SCREEN_HEIGHT * this.scale());

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    effect(() => {
      const canvas = this.canvasRef().nativeElement;
      const pixels = this.pixels();

      // Setting width/height via a template binding (even to an unchanged value)
      // resets the canvas bitmap, wiping out whatever was just drawn. Set them
      // imperatively here, guarded so they're only touched when they actually change.
      if (canvas.width !== SCREEN_WIDTH) {
        canvas.width = SCREEN_WIDTH;
      }
      if (canvas.height !== SCREEN_HEIGHT) {
        canvas.height = SCREEN_HEIGHT;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }

      const imageData = ctx.createImageData(SCREEN_WIDTH, SCREEN_HEIGHT);
      for (let y = 0; y < SCREEN_HEIGHT; y++) {
        const row = pixels[y] ?? [];
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
    });
  }
}
