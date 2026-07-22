import { ScreenBuffer } from './screen/screen-buffer';

export interface IEngineState {
  screenBuffer: ScreenBuffer;
  deltaTime: number;
}
