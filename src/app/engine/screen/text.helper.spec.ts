import { TextHelper } from './text.helper';
import { ScreenBuffer } from './screen-buffer';
import { CELL_SIZE } from './screen.constants';
import { GLYPH_QUESTION_MARK, GLYPH_UPPER_A, GLYPH_UPPER_B } from '../../data/glyphs';

describe('TextHelper', () => {
  it('should print a single character using its mapped glyph', () => {
    const screenBuffer = ScreenBuffer.create(1);

    TextHelper.print(screenBuffer, 'A', 0, 0, 0);

    expect(screenBuffer.buffers[0].slice(0, 8).map((row) => row.slice(0, 8))).toEqual(GLYPH_UPPER_A);
  });

  it('should advance one CELL_SIZE-wide column per character', () => {
    const screenBuffer = ScreenBuffer.create(1);

    TextHelper.print(screenBuffer, 'AB', 0, 0, 0);

    expect(screenBuffer.buffers[0].slice(0, 8).map((row) => row.slice(0, 8))).toEqual(GLYPH_UPPER_A);
    expect(screenBuffer.buffers[0].slice(0, 8).map((row) => row.slice(CELL_SIZE, CELL_SIZE + 8))).toEqual(GLYPH_UPPER_B);
  });

  it('should fall back to the question mark glyph for characters missing from the map', () => {
    const screenBuffer = ScreenBuffer.create(1);

    TextHelper.print(screenBuffer, '~', 0, 0, 0);

    expect(screenBuffer.buffers[0].slice(0, 8).map((row) => row.slice(0, 8))).toEqual(GLYPH_QUESTION_MARK);
  });

  it('should only draw onto the given layer', () => {
    const screenBuffer = ScreenBuffer.create(2);

    TextHelper.print(screenBuffer, 'A', 0, 0, 1);

    expect(screenBuffer.buffers[1].slice(0, 8).map((row) => row.slice(0, 8))).toEqual(GLYPH_UPPER_A);
    expect(screenBuffer.buffers[0].slice(0, 8).map((row) => row.slice(0, 8))).toEqual(GLYPH_UPPER_A.map((row) => row.map(() => 0)));
  });
});
