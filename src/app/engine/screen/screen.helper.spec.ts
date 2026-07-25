import { __, SCREEN_HEIGHT, SCREEN_WIDTH, Wt } from './screen.constants';
import { ScreenHelper } from './screen.helper';

describe('ScreenHelper', () => {
  describe('defaultPixels', () => {
    it('should fill the screen with transparent pixels', () => {
      const pixels = ScreenHelper.defaultPixels();

      expect(pixels.length).toBe(SCREEN_HEIGHT);
      expect(pixels.every((row) => row.length === SCREEN_WIDTH)).toBe(true);
      expect(pixels.every((row) => row.every((pixel) => pixel === __))).toBe(true);
    });
  });

  describe('copy', () => {
    it('should paste the source array onto the destination at the given coordinates, mutating it in place', () => {
      const destination = ScreenHelper.defaultPixels();
      const source = [
        [Wt, Wt],
        [Wt, Wt],
      ];

      ScreenHelper.copy(destination, source, 2, 3);

      expect(destination[3][2]).toBe(Wt);
      expect(destination[3][3]).toBe(Wt);
      expect(destination[4][2]).toBe(Wt);
      expect(destination[4][3]).toBe(Wt);

      // Untouched neighbors stay transparent.
      expect(destination[2][2]).toBe(__);
      expect(destination[3][1]).toBe(__);
      expect(destination[3][4]).toBe(__);
    });

    it('should clip parts of the source that fall outside the destination bounds', () => {
      const destination = ScreenHelper.defaultPixels();
      const source = [
        [Wt, Wt],
        [Wt, Wt],
      ];

      expect(() => ScreenHelper.copy(destination, source, SCREEN_WIDTH - 1, SCREEN_HEIGHT - 1)).not.toThrow();
      expect(destination[SCREEN_HEIGHT - 1][SCREEN_WIDTH - 1]).toBe(Wt);
    });
  });
});
