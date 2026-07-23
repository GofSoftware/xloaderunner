import { Keyboard } from './keyboard';

describe('Keyboard', () => {
  let keyboard: Keyboard;

  beforeEach(() => {
    keyboard = Keyboard.create();
    keyboard.attach();
  });

  afterEach(() => {
    keyboard.detach();
  });

  describe('keydown', () => {
    it('should mark the key as pressed and pressed this frame', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));

      expect(keyboard.isPressed('ArrowLeft')).toBe(true);
      expect(keyboard.wasPressedThisFrame('ArrowLeft')).toBe(true);
      expect(keyboard.wasReleasedThisFrame('ArrowLeft')).toBe(false);
    });
  });

  describe('next', () => {
    it('should keep a held key pressed but clear the this-frame flag once no keyup arrived', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));

      keyboard.next();

      expect(keyboard.isPressed('ArrowLeft')).toBe(true);
      expect(keyboard.wasPressedThisFrame('ArrowLeft')).toBe(false);
    });

    it('should keep a key pressed for the round it was released in, then drop it after next()', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
      window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));

      expect(keyboard.isPressed('Space')).toBe(true);
      expect(keyboard.wasReleasedThisFrame('Space')).toBe(true);

      keyboard.next();

      expect(keyboard.isPressed('Space')).toBe(false);
      expect(keyboard.wasReleasedThisFrame('Space')).toBe(false);
    });
  });

  describe('detach', () => {
    it('should stop recording events once detached', () => {
      keyboard.detach();

      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));

      expect(keyboard.isPressed('KeyA')).toBe(false);
    });
  });
});
