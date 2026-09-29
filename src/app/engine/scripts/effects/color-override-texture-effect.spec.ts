import { ColorOverrideTextureEffect } from './color-override-texture-effect';
import { IEngineState } from '../../i-engine-state';

describe('ColorOverrideTextureEffect', () => {
  it("should call fn with each pixel's absolute screen position, not its position within the texture", () => {
    const calls: { pixel: number; x: number; y: number }[] = [];
    const effect = ColorOverrideTextureEffect.create({} as IEngineState, (pixel, x, y) => {
      calls.push({ pixel, x, y });
      return pixel;
    });

    effect.apply(
      [
        [1, 2],
        [3, 4],
      ],
      10,
      20,
    );

    expect(calls).toEqual([
      { pixel: 1, x: 10, y: 20 },
      { pixel: 2, x: 11, y: 20 },
      { pixel: 3, x: 10, y: 21 },
      { pixel: 4, x: 11, y: 21 },
    ]);
  });

  it('should return a new texture built from fn results, without mutating the input', () => {
    const effect = ColorOverrideTextureEffect.create({} as IEngineState, (pixel) => pixel * 2);
    const texture = [[1, 2]];

    const result = effect.apply(texture, 0, 0);

    expect(result).toEqual([[2, 4]]);
    expect(texture).toEqual([[1, 2]]);
  });

  it('should leave every pixel unchanged when no fn is given', () => {
    const effect = ColorOverrideTextureEffect.create({} as IEngineState);

    expect(effect.apply([[5, 6]], 0, 0)).toEqual([[5, 6]]);
  });
});
