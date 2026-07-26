import { LETTER_A } from '../data/glyphs';
import {
  MAN_STANDING_FRAME_1,
  MAN_STANDING_FRAME_2,
  MAN_STANDING_FRAME_3,
  MAN_STANDING_FRAME_4,
  OBJECT_BRICK,
  OBJECT_STAIRS,
} from '../data/sprites';
import { ScreenBuffer } from './screen/screen-buffer';
import { Keyboard } from './keyboard/keyboard';
import { GameObject } from './game-object/game-object';
import { IEngineState } from './i-engine-state';
import { BitmapRenderer } from './scripts/bitmap-renderer';
import { BitmapSpriteRenderer } from './scripts/bitmap-sprite-renderer';
import { BackgroundStars } from './scripts/background-stars';
import { SoundPlayer } from './audio/sound-player';
import { MusicPlayer, TWINKLE_TWINKLE_LITTLE_STAR } from './audio/music-player';

const FRAME_RATE = 0;

export class Engine implements IEngineState {
  private static engineInstance: Engine;
  public static get instance(): Engine {
    return Engine.engineInstance ?? (Engine.engineInstance = new Engine());
  }

  private uiRender: ((buffer: Readonly<number[][]>) => void) | undefined;
  private started: boolean = false;
  private previousFrameTime: number = 0;
  private gameObjects: GameObject[] = [];

  public readonly screenBuffer: ScreenBuffer;
  public readonly keyboard: Keyboard;
  public readonly soundPlayer: SoundPlayer;
  public readonly musicPlayer: MusicPlayer;
  public deltaTime: number = 0;
  public fps: number = 0;

  private fpsFrameCount: number = 0;
  private fpsElapsedTime: number = 0;

  private constructor() {
    this.screenBuffer = ScreenBuffer.create();
    this.keyboard = Keyboard.create();
    this.soundPlayer = SoundPlayer.create();
    this.musicPlayer = MusicPlayer.create(this.soundPlayer);
  }

  public setRender(uiRender: (buffer: Readonly<number[][]>) => void): void {
    this.uiRender = uiRender;
  }

  public start(): void {
    this.previousFrameTime = Date.now();
    this.started = true;
    this.keyboard.attach();
    this.initLevel();
    this.render();
  }

  public stop(): void {
    this.started = false;
    this.keyboard.detach();
    this.gameObjects.forEach((gameObject) => gameObject.destroy());
  }

  private render(): void {
    if (!this.started) {
      return;
    }
    const currentFrameTime = Date.now();
    this.deltaTime = (currentFrameTime - this.previousFrameTime) / 1000;
    this.previousFrameTime = currentFrameTime;
    this.updateFps();

    this.gameObjects.forEach((gameObject) => gameObject.update());

    if (this.keyboard.wasPressedThisFrame('Enter')) {
      this.soundPlayer.play(440, 0.1);
    }

    if (this.keyboard.wasPressedThisFrame('Space')) {
      this.musicPlayer.register('Twinkle', TWINKLE_TWINKLE_LITTLE_STAR);
      this.musicPlayer.play('Twinkle');
    }

    this.uiRender && this.uiRender(this.screenBuffer.buffer);
    this.keyboard.next();
    setTimeout(() => this.render(), FRAME_RATE);
  }

  private updateFps(): void {
    this.fpsFrameCount++;
    this.fpsElapsedTime += this.deltaTime;
    if (this.fpsElapsedTime >= 1) {
      this.fps = this.fpsFrameCount / this.fpsElapsedTime;
      this.fpsFrameCount = 0;
      this.fpsElapsedTime = 0;
    }
  }

  private initLevel(): void {
    this.gameObjects = [];

    this.gameObjects.push(
      GameObject.create(this, { x: 0, y: 0 }, [(gameObject: GameObject) => BackgroundStars.create(gameObject)]),
      GameObject.create(this, { x: 0, y: 0 }, [(gameObject: GameObject) => BitmapRenderer.create(gameObject, LETTER_A)]),
      GameObject.create(this, { x: 0, y: 24 }, [(gameObject: GameObject) => BitmapRenderer.create(gameObject, OBJECT_BRICK)]),
      GameObject.create(this, { x: 8, y: 24 }, [(gameObject: GameObject) => BitmapRenderer.create(gameObject, OBJECT_BRICK)]),
      GameObject.create(this, { x: 16, y: 24 }, [(gameObject: GameObject) => BitmapRenderer.create(gameObject, OBJECT_BRICK)]),
      GameObject.create(this, { x: 24, y: 24 }, [(gameObject: GameObject) => BitmapRenderer.create(gameObject, OBJECT_STAIRS)]),
      GameObject.create(this, { x: 24, y: 32 }, [(gameObject: GameObject) => BitmapRenderer.create(gameObject, OBJECT_STAIRS)]),

      GameObject.create(this, { x: 8, y: 16 }, [
        (gameObject: GameObject) =>
          BitmapSpriteRenderer.create(
            gameObject,
            [MAN_STANDING_FRAME_2, MAN_STANDING_FRAME_4, MAN_STANDING_FRAME_2, MAN_STANDING_FRAME_4],
            2,
          ),
      ]),
    );

    this.gameObjects.forEach((gameObject) => gameObject.start());
  }
}
