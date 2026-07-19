import { _, SCREEN_HEIGHT, SCREEN_WIDTH, W } from './screen.constants';
import { ScreenHelper } from './screen.helper';

describe('ScreenHelper', () => {
  describe('defaultPixels', () => {
    it('should fill the screen with transparent pixels', () => {
      const pixels = ScreenHelper.defaultPixels();

      expect(pixels.length).toBe(SCREEN_HEIGHT);
      expect(pixels.every((row) => row.length === SCREEN_WIDTH)).toBe(true);
      expect(pixels.every((row) => row.every((pixel) => pixel === _))).toBe(true);
    });
  });

  describe('copy', () => {
    it('should paste the source array onto the destination at the given coordinates, mutating it in place', () => {
      const destination = ScreenHelper.defaultPixels();
      const source = [
        [W, W],
        [W, W],
      ];

      ScreenHelper.copy(destination, source, 2, 3);

      expect(destination[3][2]).toBe(W);
      expect(destination[3][3]).toBe(W);
      expect(destination[4][2]).toBe(W);
      expect(destination[4][3]).toBe(W);

      // Untouched neighbors stay transparent.
      expect(destination[2][2]).toBe(_);
      expect(destination[3][1]).toBe(_);
      expect(destination[3][4]).toBe(_);
    });

    it('should clip parts of the source that fall outside the destination bounds', () => {
      const destination = ScreenHelper.defaultPixels();
      const source = [
        [W, W],
        [W, W],
      ];

      expect(() => ScreenHelper.copy(destination, source, SCREEN_WIDTH - 1, SCREEN_HEIGHT - 1)).not.toThrow();
      expect(destination[SCREEN_HEIGHT - 1][SCREEN_WIDTH - 1]).toBe(W);
    });
  });
});
