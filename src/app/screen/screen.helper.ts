import { _, SCREEN_HEIGHT, SCREEN_WIDTH } from './screen.constants';

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
    return Array.from({ length: SCREEN_HEIGHT }, () => new Array<number>(SCREEN_WIDTH).fill(_));
  }

  /** Pastes `source` onto `destination` with its top-left corner at (x, y), mutating `destination` in place and clipping any part that falls outside it. */
  static copy(destination: number[][], source: number[][], x: number, y: number): void {
    for (let sy = 0; sy < source.length; sy++) {
      const destY = y + sy;
      if (destY < 0 || destY >= destination.length) {
        continue;
      }

      const sourceRow = source[sy];
      const destRow = destination[destY];
      for (let sx = 0; sx < sourceRow.length; sx++) {
        const destX = x + sx;
        if (destX < 0 || destX >= destRow.length) {
          continue;
        }
        destRow[destX] = sourceRow[sx];
      }
    }
  }
}
