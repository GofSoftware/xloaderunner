import { TestBed } from '@angular/core/testing';

import { ScreenBuffer } from './screen-buffer';
import { _, SCREEN_HEIGHT, SCREEN_WIDTH, W } from './screen.constants';

/**
 * jsdom doesn't implement a real canvas 2D context, so we stub `getContext`
 * with a minimal fake that records what render() actually paints. This lets
 * tests observe rendering through the same path the app uses, without the
 * service needing to expose its private buffer for inspection.
 */
function createTestCanvas() {
  const canvas = document.createElement('canvas');
  let lastImageData: ImageData | undefined;

  const context = {
    createImageData: (width: number, height: number) => ({ data: new Uint8ClampedArray(width * height * 4) }) as ImageData,
    putImageData: (imageData: ImageData) => {
      lastImageData = imageData;
    },
  };

  vi.spyOn(canvas, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);

  function pixelAt(x: number, y: number): number {
    if (!lastImageData) {
      throw new Error('Nothing has been rendered yet');
    }
    const offset = (y * SCREEN_WIDTH + x) * 4;
    const [r, g, b, a] = lastImageData.data.slice(offset, offset + 4);
    return ((r << 24) | (g << 16) | (b << 8) | a) >>> 0;
  }

  return { canvas, pixelAt };
}

describe('ScreenBuffer', () => {
  let service: ScreenBuffer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScreenBuffer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should throw if copy() is called before startUpdate()', () => {
    expect(() => service.copy([[W]], 0, 0)).toThrow();
  });

  it('should throw for further copy() calls once the update count has returned to zero', () => {
    service.startUpdate();
    service.copy([[W]], 0, 0);
    service.stopUpdate();

    expect(() => service.copy([[W]], 0, 0)).toThrow();
  });

  describe('init', () => {
    it('should size the canvas to the screen resolution and paint the initial (all-transparent) buffer onto it', () => {
      const { canvas, pixelAt } = createTestCanvas();

      service.init(canvas);

      expect(canvas.width).toBe(SCREEN_WIDTH);
      expect(canvas.height).toBe(SCREEN_HEIGHT);
      expect(pixelAt(0, 0)).toBe(_);
    });
  });

  describe('startUpdate / copy / stopUpdate', () => {
    it('should not re-render until the update count returns to zero', () => {
      const { canvas, pixelAt } = createTestCanvas();
      service.init(canvas);

      service.startUpdate();
      service.copy([[W]], 0, 0);

      expect(pixelAt(0, 0)).toBe(_);

      service.stopUpdate();

      expect(pixelAt(0, 0)).toBe(W);
    });

    it('should support nested start/stop pairs, only re-rendering once the outermost pair closes', () => {
      const { canvas, pixelAt } = createTestCanvas();
      service.init(canvas);

      service.startUpdate();
      service.startUpdate();
      service.copy([[W]], 1, 1);
      service.stopUpdate();

      // Still one outstanding startUpdate — must not have re-rendered yet.
      expect(pixelAt(1, 1)).toBe(_);

      service.stopUpdate();

      expect(pixelAt(1, 1)).toBe(W);
    });
  });
});
