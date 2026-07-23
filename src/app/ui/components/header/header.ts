import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { Engine } from '../../../engine/engine';

const FPS_UPDATE_INTERVAL_MS = 1000;

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  readonly scale = input(1);

  protected readonly fps = signal(Engine.instance.fps);

  constructor() {
    const intervalId = setInterval(() => {
      this.fps.set(Engine.instance.fps);
    }, FPS_UPDATE_INTERVAL_MS);

    inject(DestroyRef).onDestroy(() => clearInterval(intervalId));
  }
}
