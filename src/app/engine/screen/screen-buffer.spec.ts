import { ScreenBuffer } from './screen-buffer';
import { __, SCREEN_HEIGHT, SCREEN_WIDTH, Wt } from './screen.constants';

describe('ScreenBuffer', () => {
  it('should be created', () => {
    expect(ScreenBuffer.create()).toBeTruthy();
  });

  it('should start with an all-transparent buffer', () => {
    const screenBuffer = ScreenBuffer.create();

    expect(screenBuffer.buffer.length).toBe(SCREEN_HEIGHT);
    expect(screenBuffer.buffer.every((row) => row.length === SCREEN_WIDTH)).toBe(true);
    expect(screenBuffer.buffer.every((row) => row.every((pixel) => pixel === __))).toBe(true);
  });

  it('should copy a source array into the buffer at the given coordinates', () => {
    const screenBuffer = ScreenBuffer.create();

    screenBuffer.copy([[Wt, Wt]], 2, 3);

    expect(screenBuffer.buffer[3][2]).toBe(Wt);
    expect(screenBuffer.buffer[3][3]).toBe(Wt);
    expect(screenBuffer.buffer[3][1]).toBe(__);
    expect(screenBuffer.buffer[3][4]).toBe(__);
  });
});
