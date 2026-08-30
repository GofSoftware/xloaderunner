import { Component, signal } from '@angular/core';
import { Header } from './ui/components/header/header';
import { Screen } from './ui/components/screen/screen';
import { Engine } from './engine/engine';
import { XLodeRunner } from './game-x-loade-runner/x-lode-runner';

@Component({
  selector: 'app-root',
  imports: [Header, Screen],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {

  protected readonly scale = signal(1);

  constructor() {
  }

  public async ngOnInit() {
    await Engine.instance.start(XLodeRunner.create());
  }
}
