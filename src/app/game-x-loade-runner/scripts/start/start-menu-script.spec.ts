import { vi } from 'vitest';
import { StartMenuScript } from './start-menu-script';
import { GameObject } from '../../../engine/game-object/game-object';
import { IEngineState } from '../../../engine/i-engine-state';
import { Keyboard } from '../../../engine/keyboard/keyboard';

describe('StartMenuScript', () => {
  let keyboard: Keyboard;
  let engineState: IEngineState;

  function createScript(continueCallback: () => void): StartMenuScript {
    const gameObject = GameObject.create('Menu', engineState, { x: 0, y: 0 }, [(go) => StartMenuScript.create(go, continueCallback)]);
    return gameObject.getScript(StartMenuScript)!;
  }

  beforeEach(() => {
    keyboard = Keyboard.create();
    keyboard.attach();
    engineState = { keyboard } as unknown as IEngineState;
  });

  afterEach(() => {
    keyboard.detach();
  });

  it('should call the continue callback once any key has been pressed this round', () => {
    const continueCallback = vi.fn();
    const script = createScript(continueCallback);

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    script.update();

    expect(continueCallback).toHaveBeenCalledTimes(1);
  });

  it('should not call the continue callback while no key has been pressed this round', () => {
    const continueCallback = vi.fn();
    const script = createScript(continueCallback);

    script.update();

    expect(continueCallback).not.toHaveBeenCalled();
  });

  it('should call the continue callback again on a later round if a key is pressed again', () => {
    const continueCallback = vi.fn();
    const script = createScript(continueCallback);

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    script.update();
    keyboard.next();

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));
    script.update();

    expect(continueCallback).toHaveBeenCalledTimes(2);
  });
});
