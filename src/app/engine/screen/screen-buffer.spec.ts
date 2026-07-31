import { ScreenBuffer } from './screen-buffer';
import { __, SCREEN_HEIGHT, SCREEN_WIDTH, Wt } from './screen.constants';

describe('ScreenBuffer', () => {
  it('should be created', () => {
    expect(ScreenBuffer.create(1)).toBeTruthy();
  });

  it('should start with all-transparent buffers, one per layer', () => {
    const screenBuffer = ScreenBuffer.create(2);

    expect(screenBuffer.buffers.length).toBe(2);
    screenBuffer.buffers.forEach((buffer) => {
      expect(buffer.length).toBe(SCREEN_HEIGHT);
      expect(buffer.every((row) => row.length === SCREEN_WIDTH)).toBe(true);
      expect(buffer.every((row) => row.every((pixel) => pixel === __))).toBe(true);
    });
  });

  it('should copy a source array into the given layer at the given coordinates', () => {
    const screenBuffer = ScreenBuffer.create(1);

    screenBuffer.copy([[Wt, Wt]], 2, 3, 0);

    expect(screenBuffer.buffers[0][3][2]).toBe(Wt);
    expect(screenBuffer.buffers[0][3][3]).toBe(Wt);
    expect(screenBuffer.buffers[0][3][1]).toBe(__);
    expect(screenBuffer.buffers[0][3][4]).toBe(__);
  });

  it('should keep layers independent of each other', () => {
    const screenBuffer = ScreenBuffer.create(2);

    screenBuffer.copy([[Wt]], 0, 0, 1);

    expect(screenBuffer.buffers[1][0][0]).toBe(Wt);
    expect(screenBuffer.buffers[0][0][0]).toBe(__);
  });

  it('should reset every layer to transparent on clear', () => {
    const screenBuffer = ScreenBuffer.create(2);
    screenBuffer.copy([[Wt]], 0, 0, 0);
    screenBuffer.copy([[Wt]], 1, 1, 1);

    screenBuffer.clear();

    screenBuffer.buffers.forEach((buffer) => {
      expect(buffer.every((row) => row.every((pixel) => pixel === __))).toBe(true);
    });
  });
});
