import { Component, ElementRef, afterNextRender, computed, effect, inject, output, signal, viewChild } from '@angular/core';
import { ScreenBuffer } from './screen-buffer';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from './screen.constants';

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
  private readonly buffer = inject(ScreenBuffer);

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
      this.buffer.init(this.canvasRef().nativeElement);
    });
  }

  protected onResize(): void {
    this.windowWidth.set(window.innerWidth);
  }
}
