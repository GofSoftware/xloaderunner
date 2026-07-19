import { BLACK_PIXEL, WHITE_PIXEL } from './screen.constants';

// 8x8 bitmap font glyphs. '1' -> white pixel, '0' -> black pixel.
function glyph(rows: readonly string[]): number[][] {
  return rows.map((row) => row.split('').map((bit) => (bit === '1' ? WHITE_PIXEL : BLACK_PIXEL)));
}

export const LETTER_A: number[][] = glyph([
  '00011000',
  '00111100',
  '01100110',
  '01100110',
  '01111110',
  '01100110',
  '01100110',
  '00000000',
]);
