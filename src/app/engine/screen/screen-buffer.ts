import { ScreenHelper } from './screen.helper';

export class ScreenBuffer {
  public static create(): ScreenBuffer {
    return new ScreenBuffer();
  }

  private screenBuffer: number[][] = ScreenHelper.defaultPixels();

  public get buffer(): Readonly<number[][]> {
    return this.screenBuffer;
  }

  copy(source: number[][], x: number, y: number): void {
    ScreenHelper.copy(this.screenBuffer, source, x, y);
  }

}
