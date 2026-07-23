import { ScreenBuffer } from './screen/screen-buffer';
import { Keyboard } from './keyboard/keyboard';
import { SoundPlayer } from './audio/sound-player';

export interface IEngineState {
  screenBuffer: ScreenBuffer;
  keyboard: Keyboard;
  soundPlayer: SoundPlayer;
  deltaTime: number;
  fps: number;
}
