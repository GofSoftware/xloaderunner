import { Component, ElementRef, afterNextRender, computed, effect, output, signal, viewChildren } from '@angular/core';
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

  protected readonly layerIndices: number[] = Array.from({ length: Engine.instance.screenBuffer.buffers.length }, (_, index) => index);

  private readonly canvasRefs = viewChildren<ElementRef<HTMLCanvasElement>>('layerCanvas');

  constructor() {
    effect(() => {
      this.scaleChange.emit(this.scale());
    });

    afterNextRender(() => {
      Engine.instance.setRender((buffers: ReadonlyArray<Readonly<number[][]>>) => {
        this.render(buffers);
      });
    });
  }

  protected onMouseMove(event: MouseEvent): void {
    const x = Math.floor(event.offsetX / this.scale());
    const y = Math.floor(event.offsetY / this.scale());
    Engine.instance.logTiles(x, y);
  };

  protected onResize(): void {
    this.windowWidth.set(window.innerWidth);
  }

  private render(buffers: ReadonlyArray<Readonly<number[][]>>): void {
    const canvasRefs = this.canvasRefs();
    buffers.forEach((buffer, index) => {
      const canvas = canvasRefs[index]?.nativeElement;
      if (canvas) {
        this.renderLayer(canvas, buffer);
      }
    });
  }

  private renderLayer(canvas: HTMLCanvasElement, buffer: Readonly<number[][]>): void {
    // Setting width/height (even to an unchanged value) resets the canvas
    // bitmap, wiping out whatever was just drawn. Guard so they're only
    // touched when they actually change.
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
