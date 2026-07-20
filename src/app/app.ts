import { Component, inject, signal } from '@angular/core';
import { Header } from './header/header';
import { ScreenBuffer } from './screen/screen-buffer';
import { LETTER_A } from './screen/glyphs';
import { Screen } from './screen/screen';
import { MAN_STANDING_FRAME_1, OBJECT_BRICK, OBJECT_STAIRS } from './screen/sprites';

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
