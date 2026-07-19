import { Component, signal } from '@angular/core';
import { Header } from './header/header';
import { Screen } from './screen/screen';
import { DEFAULT_SCALE } from './screen/screen.constants';

@Component({
  selector: 'app-root',
  imports: [Header, Screen],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly scale = signal(DEFAULT_SCALE);
}
