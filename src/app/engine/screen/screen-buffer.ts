import { ScreenHelper } from './screen.helper';
import { ColorOverride } from '../scripts/renderer/color-override';

export class ScreenBuffer {
  public static create(layerCount: number): ScreenBuffer {
    return new ScreenBuffer(layerCount);
  }

  private readonly layers: number[][][];

  private constructor(layerCount: number) {
    this.layers = Array.from({ length: layerCount }, () => ScreenHelper.defaultPixels());
  }

  public get buffers(): ReadonlyArray<Readonly<number[][]>> {
    return this.layers;
  }

  copy(source: number[][], x: number, y: number, layer: number, colorOverrides: ColorOverride[] = []): void {
    ScreenHelper.copy(this.layers[layer], source, x, y, colorOverrides);
  }

  clear(): void {
    this.layers.forEach((layer) => ScreenHelper.clear(layer));
  }
}
