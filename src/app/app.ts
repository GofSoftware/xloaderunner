import { Component, inject, signal } from '@angular/core';
import { Header } from './ui/components/header/header';
import { Screen } from './ui/components/screen/screen';
import { Engine } from './engine/engine';

@Component({
  selector: 'app-root',
  imports: [Header, Screen],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {

  protected readonly scale = signal(1);

  constructor() {
    Engine.instance.start();
  }
}
