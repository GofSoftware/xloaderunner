import { GLYPH_MAP } from '../../data/glyphs';
import { ScreenBuffer } from './screen-buffer';
import { CELL_SIZE } from './screen.constants';

export class TextHelper {
  /** Draws `text` onto `screenBuffer` one glyph per CELL_SIZE-wide column, starting at (x, y). Characters missing from GLYPH_MAP fall back to the '?' glyph. */
  static print(screenBuffer: ScreenBuffer, text: string, x: number, y: number, layer: number): void {
    for (let i = 0; i < text.length; i++) {
      const glyph = GLYPH_MAP[text[i]] ?? GLYPH_MAP['?'];
      screenBuffer.copy(glyph, x + i * CELL_SIZE, y, layer);
    }
  }
}
