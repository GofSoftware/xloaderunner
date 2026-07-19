import { BLACK_PIXEL, SCREEN_HEIGHT, SCREEN_WIDTH, WHITE_PIXEL } from './screen.constants';
import { ScreenHelper } from './screen.helper';

describe('ScreenHelper', () => {
  describe('defaultPixels', () => {
    it('should fill the screen with opaque black pixels', () => {
      const pixels = ScreenHelper.defaultPixels();

      expect(pixels.length).toBe(SCREEN_HEIGHT);
      expect(pixels.every((row) => row.length === SCREEN_WIDTH)).toBe(true);
      expect(pixels.every((row) => row.every((pixel) => pixel === BLACK_PIXEL))).toBe(true);
    });
  });

  describe('copy', () => {
    it('should paste the source array onto the destination at the given coordinates', () => {
      const destination = ScreenHelper.defaultPixels();
      const source = [
        [WHITE_PIXEL, WHITE_PIXEL],
        [WHITE_PIXEL, WHITE_PIXEL],
      ];

      const result = ScreenHelper.copy(destination, source, 2, 3);

      expect(result[3][2]).toBe(WHITE_PIXEL);
      expect(result[3][3]).toBe(WHITE_PIXEL);
      expect(result[4][2]).toBe(WHITE_PIXEL);
      expect(result[4][3]).toBe(WHITE_PIXEL);

      // Untouched neighbors stay black.
      expect(result[2][2]).toBe(BLACK_PIXEL);
      expect(result[3][1]).toBe(BLACK_PIXEL);
      expect(result[3][4]).toBe(BLACK_PIXEL);
    });

    it('should not mutate the destination array', () => {
      const destination = ScreenHelper.defaultPixels();
      const source = [[WHITE_PIXEL]];

      ScreenHelper.copy(destination, source, 0, 0);

      expect(destination[0][0]).toBe(BLACK_PIXEL);
    });

    it('should clip parts of the source that fall outside the destination bounds', () => {
      const destination = ScreenHelper.defaultPixels();
      const source = [
        [WHITE_PIXEL, WHITE_PIXEL],
        [WHITE_PIXEL, WHITE_PIXEL],
      ];

      expect(() => ScreenHelper.copy(destination, source, SCREEN_WIDTH - 1, SCREEN_HEIGHT - 1)).not.toThrow();

      const result = ScreenHelper.copy(destination, source, SCREEN_WIDTH - 1, SCREEN_HEIGHT - 1);
      expect(result[SCREEN_HEIGHT - 1][SCREEN_WIDTH - 1]).toBe(WHITE_PIXEL);
    });
  });
});
