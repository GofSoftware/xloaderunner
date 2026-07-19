import { TestBed } from '@angular/core/testing';

import { ScreenBuffer } from './screen-buffer';
import { BLACK_PIXEL, WHITE_PIXEL } from './screen.constants';

describe('ScreenBuffer', () => {
  let service: ScreenBuffer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScreenBuffer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with an all-black buffer', () => {
    expect(service.pixels().every((row) => row.every((pixel) => pixel === BLACK_PIXEL))).toBe(true);
  });

  it('should throw if copy() is called before startUpdate()', () => {
    expect(() => service.copy([[WHITE_PIXEL]], 0, 0)).toThrow();
  });

  it('should not publish pixel changes until the update count returns to zero', () => {
    service.startUpdate();
    service.copy([[WHITE_PIXEL]], 0, 0);

    expect(service.pixels()[0][0]).toBe(BLACK_PIXEL);

    service.stopUpdate();

    expect(service.pixels()[0][0]).toBe(WHITE_PIXEL);
  });

  it('should support nested start/stop pairs, only rendering once the outermost pair closes', () => {
    service.startUpdate();
    service.startUpdate();
    service.copy([[WHITE_PIXEL]], 1, 1);
    service.stopUpdate();

    // Still one outstanding startUpdate — must not have rendered yet.
    expect(service.pixels()[1][1]).toBe(BLACK_PIXEL);

    service.stopUpdate();

    expect(service.pixels()[1][1]).toBe(WHITE_PIXEL);
  });

  it('should throw for further copy() calls once the update count has returned to zero', () => {
    service.startUpdate();
    service.copy([[WHITE_PIXEL]], 0, 0);
    service.stopUpdate();

    expect(() => service.copy([[WHITE_PIXEL]], 0, 0)).toThrow();
  });
});
