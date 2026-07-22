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
import { GameObject } from './game-object/game-object';
import { IEngineState } from './i-engine-state';
import { BitmapRenderer } from './scripts/bitmap-renderer';
import { BitmapSpriteRenderer } from './scripts/bitmap-sprite-renderer';

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
  public deltaTime: number = 0;

  private constructor() {
    this.screenBuffer = ScreenBuffer.create();
  }

  public setRender(uiRender: (buffer: Readonly<number[][]>) => void): void {
    this.uiRender = uiRender;
  }

  public start(): void {
    this.previousFrameTime = Date.now();
    this.started = true;
    this.initLevel();
    this.render();
  }

  public stop(): void {
    this.started = false;
    this.gameObjects.forEach((gameObject) => gameObject.destroy());
  }

  private render(): void {
    if (!this.started) {
      return;
    }
    const currentFrameTime = Date.now();
    this.deltaTime = (currentFrameTime - this.previousFrameTime) / 1000;
    this.previousFrameTime = currentFrameTime;

    this.gameObjects.forEach((gameObject) => gameObject.update());

    this.uiRender && this.uiRender(this.screenBuffer.buffer);
    setTimeout(() => this.render(), FRAME_RATE);
  }

  private initLevel(): void {
    this.gameObjects = [];

    this.gameObjects.push(
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
