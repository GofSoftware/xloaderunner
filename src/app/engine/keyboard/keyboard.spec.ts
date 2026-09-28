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

  describe('reset', () => {
    it('should clear held and pressed-this-round state', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));

      keyboard.reset();

      expect(keyboard.isPressed('ArrowLeft')).toBe(false);
      expect(keyboard.wasPressedThisFrame('ArrowLeft')).toBe(false);
    });

    it('should leave the keyboard able to record new presses afterward', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
      keyboard.reset();

      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

      expect(keyboard.isPressed('ArrowRight')).toBe(true);
    });
  });

  describe('pressedThisRoundCodes', () => {
    it('should list every code pressed this round', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

      expect(keyboard.pressedThisRoundCodes.sort()).toEqual(['ArrowLeft', 'ArrowRight']);
    });

    it('should be empty once no key has been pressed this round', () => {
      expect(keyboard.pressedThisRoundCodes).toEqual([]);
    });
  });
});
