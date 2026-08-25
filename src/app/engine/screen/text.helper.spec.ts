import { TextHelper } from './text.helper';
import { ScreenBuffer } from './screen-buffer';
import { CELL_SIZE } from './screen.constants';
import { GLYPH_QUESTION_MARK, GLYPH_UPPER_A, GLYPH_UPPER_B } from '../../game-x-loade-runner/data/glyphs';
import { ITextureEffect } from '../scripts/effects/i-texture-effect';

function createEffect(apply: (texture: number[][]) => number[][], isEnabled = true): ITextureEffect {
  return { isEnabled, apply };
}

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

  it('should draw the glyph unmodified when no effects are given', () => {
    const screenBuffer = ScreenBuffer.create(1);

    TextHelper.print(screenBuffer, 'A', 0, 0, 0, []);

    expect(screenBuffer.buffers[0].slice(0, 8).map((row) => row.slice(0, 8))).toEqual(GLYPH_UPPER_A);
  });

  it('should run each glyph through every effect, in order, before drawing it', () => {
    const screenBuffer = ScreenBuffer.create(1);
    const zeroOut = createEffect((glyph) => glyph.map((row) => row.map(() => 0)));
    const setToOne = createEffect((glyph) => glyph.map((row) => row.map(() => 1)));

    TextHelper.print(screenBuffer, 'A', 0, 0, 0, [zeroOut, setToOne]);

    expect(screenBuffer.buffers[0].slice(0, 8).map((row) => row.slice(0, 8))).toEqual(GLYPH_UPPER_A.map((row) => row.map(() => 1)));
  });

  it('should apply effects to every character printed', () => {
    const screenBuffer = ScreenBuffer.create(1);
    const setToOne = createEffect((glyph) => glyph.map((row) => row.map(() => 1)));

    TextHelper.print(screenBuffer, 'AB', 0, 0, 0, [setToOne]);

    expect(screenBuffer.buffers[0].slice(0, 8).map((row) => row.slice(0, 8))).toEqual(GLYPH_UPPER_A.map((row) => row.map(() => 1)));
    expect(screenBuffer.buffers[0].slice(0, 8).map((row) => row.slice(CELL_SIZE, CELL_SIZE + 8))).toEqual(
      GLYPH_UPPER_B.map((row) => row.map(() => 1)),
    );
  });

  it('should not mutate the shared GLYPH_MAP entry when an effect returns a new array', () => {
    const screenBuffer = ScreenBuffer.create(1);
    const setToOne = createEffect((glyph) => glyph.map((row) => row.map(() => 1)));
    const originalGlyph = GLYPH_UPPER_A.map((row) => [...row]);

    TextHelper.print(screenBuffer, 'A', 0, 0, 0, [setToOne]);

    expect(GLYPH_UPPER_A).toEqual(originalGlyph);
  });

  it('should skip a disabled effect while still applying the others', () => {
    const screenBuffer = ScreenBuffer.create(1);
    const disabledZeroOut = createEffect((glyph) => glyph.map((row) => row.map(() => 0)), false);
    const setToOne = createEffect((glyph) => glyph.map((row) => row.map(() => 1)));

    TextHelper.print(screenBuffer, 'A', 0, 0, 0, [disabledZeroOut, setToOne]);

    expect(screenBuffer.buffers[0].slice(0, 8).map((row) => row.slice(0, 8))).toEqual(GLYPH_UPPER_A.map((row) => row.map(() => 1)));
  });
});
