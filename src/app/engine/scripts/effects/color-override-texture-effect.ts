import { TextureEffect } from './i-texture-effect';
import { IEngineState } from '../../i-engine-state';

export type ColorOverrideFn = (pixel: number, x: number, y: number) => number;

export class ColorOverrideTextureEffect extends TextureEffect {
  public static create(engineState: IEngineState, fn: ColorOverrideFn = (v) => v): ColorOverrideTextureEffect {
    return new ColorOverrideTextureEffect(engineState, fn);
  }

  private constructor(
    engineState: IEngineState,
    private fn: ColorOverrideFn,
  ) {
    super(engineState);
  }

  public apply(texture: number[][]): number[][] {
    const res = new Array(texture.length);

    texture.forEach((row, y) => {
      res[y] = new Array(row.length);
      row.forEach((pixel, x) => {
        res[y][x] = this.fn(pixel, x, y);
      });
    });

    return res;
  }
}
