import { ScreenHelper } from './screen.helper';

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

  copy(source: number[][], x: number, y: number, layer: number): void {
    ScreenHelper.copy(this.layers[layer], source, x, y);
  }

  clear(): void {
    this.layers.forEach((layer) => ScreenHelper.clear(layer));
  }
}
