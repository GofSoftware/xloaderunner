import { GLYPH_MAP } from '../../game-x-loade-runner/data/glyphs';
import { ScreenBuffer } from './screen-buffer';
import { CELL_SIZE } from './screen.constants';
import { ITextureEffect } from '../scripts/effects/i-texture-effect';

export class TextHelper {
  /**
   * Draws `text` onto `screenBuffer` one glyph per CELL_SIZE-wide column, starting at (x, y). Characters
   * missing from GLYPH_MAP fall back to the '?' glyph. Each glyph is piped through `effects`, in order,
   * before being drawn.
   */
  static print(screenBuffer: ScreenBuffer, text: string, x: number, y: number, layer: number, effects: ITextureEffect[] = []): void {
    for (let i = 0; i < text.length; i++) {
      const glyph = GLYPH_MAP[text[i]] ?? GLYPH_MAP['?'];
      const effectedGlyph = effects.reduce((currentGlyph, effect) => (effect.isEnabled ? effect.apply(currentGlyph) : currentGlyph), glyph);
      screenBuffer.copy(effectedGlyph, x + i * CELL_SIZE, y, layer);
    }
  }
}
