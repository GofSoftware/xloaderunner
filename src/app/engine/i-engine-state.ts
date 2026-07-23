import { ScreenBuffer } from './screen/screen-buffer';
import { Keyboard } from './keyboard/keyboard';
import { SoundPlayer } from './audio/sound-player';
import { MusicPlayer } from './audio/music-player';

export interface IEngineState {
  screenBuffer: ScreenBuffer;
  keyboard: Keyboard;
  soundPlayer: SoundPlayer;
  musicPlayer: MusicPlayer;
  deltaTime: number;
  fps: number;
}
