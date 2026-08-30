import { ScreenBuffer } from './screen/screen-buffer';
import { Keyboard } from './keyboard/keyboard';
import { SoundPlayer } from './audio/sound-player';
import { MusicPlayer } from './audio/music-player';
import { GameObject } from './game-object/game-object';
import { ILevel } from './i-level';

export interface IEngineState {
  screenBuffer: ScreenBuffer;
  keyboard: Keyboard;
  soundPlayer: SoundPlayer;
  musicPlayer: MusicPlayer;
  deltaTime: number;
  fps: number;
  timeFromStart: number;
  startedAt: number;
  level: ILevel;

  addGameObject(gameObject: GameObject, after?: GameObject): void;
  removeGameObject(gameObject: GameObject): void;
  getGameObjectByName(name: string): GameObject | undefined;
}
