import { Component, computed, model } from '@angular/core';
import { DEFAULT_SCALE, SCALE_MAX, SCALE_MIN, SCALE_STEP } from '../screen/screen.constants';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  readonly scale = model(DEFAULT_SCALE);

  protected readonly canDecrease = computed(() => this.scale() > SCALE_MIN);
  protected readonly canIncrease = computed(() => this.scale() < SCALE_MAX);

  protected decrease(): void {
    this.scale.update((value) => Math.max(SCALE_MIN, value - SCALE_STEP));
  }

  protected increase(): void {
    this.scale.update((value) => Math.min(SCALE_MAX, value + SCALE_STEP));
  }
}
