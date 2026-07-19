import { SCREEN_HEIGHT, SCREEN_WIDTH } from './screen.constants';

export class ScreenHelper {
  static unpackRgba(value: number): [number, number, number, number] {
    const unsigned = value >>> 0;
    const r = (unsigned >>> 24) & 0xff;
    const g = (unsigned >>> 16) & 0xff;
    const b = (unsigned >>> 8) & 0xff;
    const a = unsigned & 0xff;
    return [r, g, b, a];
  }

  static defaultPixels(): number[][] {
    const pixels: number[][] = [];
    for (let y = 0; y < SCREEN_HEIGHT; y++) {
      const row: number[] = [];
      for (let x = 0; x < SCREEN_WIDTH; x++) {
        const r = Math.floor((x / (SCREEN_WIDTH - 1)) * 255);
        const g = Math.floor((y / (SCREEN_HEIGHT - 1)) * 255);
        const b = 255 - r;
        row.push(((r << 24) | (g << 16) | (b << 8) | 0xff) >>> 0);
      }
      pixels.push(row);
    }
    return pixels;
  }
}
