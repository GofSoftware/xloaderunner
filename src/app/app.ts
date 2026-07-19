import { Component, signal } from '@angular/core';
import { Header } from './header/header';
import { LETTER_A } from './screen/glyphs';
import { Screen } from './screen/screen';
import { ScreenHelper } from './screen/screen.helper';
import { DEFAULT_SCALE } from './screen/screen.constants';

@Component({
  selector: 'app-root',
  imports: [Header, Screen],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly scale = signal(DEFAULT_SCALE);
  protected readonly pixels = ScreenHelper.copy(ScreenHelper.defaultPixels(), LETTER_A, 10, 10);
}
