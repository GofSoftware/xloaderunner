import { Component, inject, signal } from '@angular/core';
import { Header } from './header/header';
import { ScreenBuffer } from './screen/screen-buffer';
import { LETTER_A } from './screen/glyphs';
import { Screen } from './screen/screen';

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
    this.screenBuffer.copy(LETTER_A, 10, 10);
    this.screenBuffer.stopUpdate();
  }
}
