import { LETTER_A } from '../data/glyphs';
import { MAN_STANDING_FRAME_1, OBJECT_BRICK, OBJECT_STAIRS } from '../data/sprites';
import { ScreenBuffer } from './screen/screen-buffer';

const FRAME_RATE = 0;

export class Engine {
  private static engineInstance: Engine;
  public static get instance(): Engine {
    return Engine.engineInstance ?? (Engine.engineInstance = new Engine());
  }

  private uiRender: ((buffer: Readonly<number[][]>) => void) | undefined;
  private readonly screenBuffer: ScreenBuffer;
  private started: boolean = false;
  private previousFrameTime: number = 0;

  private constructor() {
    this.screenBuffer = ScreenBuffer.create();
  }

  public setRender(uiRender: (buffer: Readonly<number[][]>) => void): void {
    this.uiRender = uiRender;
  }

  public start(): void {
    this.previousFrameTime = Date.now();
    this.started = true;
  }

  public stop(): void {
    this.started = false;
  }

  private render(): void {
    if (!this.started) {
      return
    }
    const currentFrameTime = Date.now();
    const deltaTime = currentFrameTime - this.previousFrameTime;
    this.previousFrameTime = currentFrameTime;

    this.screenBuffer.copy(LETTER_A, 0, 8);
    this.screenBuffer.copy(MAN_STANDING_FRAME_1, 16, 8);
    this.screenBuffer.copy(OBJECT_BRICK, 8, 16);
    this.screenBuffer.copy(OBJECT_BRICK, 16, 16);
    this.screenBuffer.copy(OBJECT_BRICK, 24, 16);
    this.screenBuffer.copy(OBJECT_STAIRS, 32, 16);
    this.screenBuffer.copy(OBJECT_STAIRS, 32, 24);
    this.uiRender && this.uiRender(this.screenBuffer.buffer);
    setTimeout(() => this.render(), FRAME_RATE);
  }
}
