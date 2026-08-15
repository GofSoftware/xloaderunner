import { TextureEffect } from './i-texture-effect';
import { IEngineState } from '../../i-engine-state';

export class DissolveTextureEffect extends TextureEffect {
  public static create(engineState: IEngineState, speed: number, fn: (v: number) => number = (v) => v): DissolveTextureEffect {
    return new DissolveTextureEffect(engineState, speed, fn);
  }

  private value: number = 0;

  private constructor(
    engineState: IEngineState,
    private speed: number,
    private fn: (v: number) => number = (v) => v,
  ) {
    super(engineState);
  }
  public apply(texture: number[][]): number[][] {
    this.value += this.speed * this.enginesState.deltaTime;
    this.value = this.value > 255 ? 255 : this.value;

    const res = new Array(texture.length);

    texture.forEach((row, y) => {
      res[y] = new Array(row.length);
      row.forEach((cell, x) => {
        let resAlpha = (cell & 0xff) - this.fn(this.value);
        if (resAlpha < 0) {
          resAlpha = 0;
        }
        res[y][x] = (cell & 0xffffff00) + Math.ceil(resAlpha);
      });
    });

    return res;
  }
}
