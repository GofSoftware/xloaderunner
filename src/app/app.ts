import { Component, inject, signal } from '@angular/core';
import { Header } from './ui/components/header/header';
import { ScreenBuffer } from './ui/components/screen/screen-buffer';
import { LETTER_A } from './data/glyphs';
import { MAN_STANDING_FRAME_1, OBJECT_BRICK, OBJECT_STAIRS } from './data/sprites';
import { Screen } from './ui/components/screen/screen';

@Component({
  selector: 'app-root',
  imports: [Header, Screen],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly screenBuffer = inject(ScreenBuffer);

  protected readonly scale = signal(1);

  constructor() {
    this.screenBuffer.startUpdate();
    this.screenBuffer.copy(LETTER_A, 0, 8);
    this.screenBuffer.copy(MAN_STANDING_FRAME_1, 16, 8);
    this.screenBuffer.copy(OBJECT_BRICK, 8, 16);
    this.screenBuffer.copy(OBJECT_BRICK, 16, 16);
    this.screenBuffer.copy(OBJECT_BRICK, 24, 16);
    this.screenBuffer.copy(OBJECT_STAIRS, 32, 16);
    this.screenBuffer.stopUpdate();
  }
}
