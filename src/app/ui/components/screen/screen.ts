import { Component, ElementRef, afterNextRender, computed, effect, output, signal, viewChild } from '@angular/core';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../../engine/screen/screen.constants';
import { Engine } from '../../../engine/engine';
import { ScreenHelper } from '../../../engine/screen/screen.helper';

@Component({
  selector: 'app-screen',
  imports: [],
  templateUrl: './screen.html',
  styleUrl: './screen.scss',
  host: {
    '(window:resize)': 'onResize()',
  },
})
export class Screen {

  readonly scaleChange = output<number>();

  private readonly windowWidth = signal(window.innerWidth);

  protected readonly scale = computed(() => this.windowWidth() / SCREEN_WIDTH);
  protected readonly canvasWidth = computed(() => this.windowWidth());
  protected readonly canvasHeight = computed(() => SCREEN_HEIGHT * this.scale());

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    effect(() => {
      this.scaleChange.emit(this.scale());
    });

    afterNextRender(() => {
      Engine.instance.setRender((buffer: Readonly<number[][]>) => {
        this.render(buffer);
      });
    });
  }

  protected onResize(): void {
    this.windowWidth.set(window.innerWidth);
  }

  private render(buffer: Readonly<number[][]>): void {
    if (!this.canvasRef()?.nativeElement) {
      return;
    }

    // Setting width/height (even to an unchanged value) resets the canvas
    // bitmap, wiping out whatever was just drawn. Guard so they're only
    // touched when they actually change.
    if (this.canvasRef().nativeElement.width !== SCREEN_WIDTH) {
      this.canvasRef().nativeElement.width = SCREEN_WIDTH;
    }
    if (this.canvasRef().nativeElement.height !== SCREEN_HEIGHT) {
      this.canvasRef().nativeElement.height = SCREEN_HEIGHT;
    }

    const ctx = this.canvasRef().nativeElement.getContext('2d');
    if (!ctx) {
      return;
    }

    const imageData = ctx.createImageData(SCREEN_WIDTH, SCREEN_HEIGHT);
    for (let y = 0; y < SCREEN_HEIGHT; y++) {
      const row = buffer[y] ?? [];
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
