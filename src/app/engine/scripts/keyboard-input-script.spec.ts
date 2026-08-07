import { vi } from 'vitest';
import { KeyboardInputScript } from './keyboard-input-script';
import { StateScript } from './state-script';
import { TileMap } from './tile-map';
import { GameObject } from '../game-object/game-object';
import { Keyboard } from '../keyboard/keyboard';
import { ScreenBuffer } from '../screen/screen-buffer';
import { LAYER_COUNT } from '../screen/screen.constants';
import { IEngineState } from '../i-engine-state';
import { Lives } from '../lives';

describe('KeyboardInputScript', () => {
  let engineState: IEngineState;
  let keyboard: Keyboard;
  let stateScript: StateScript;
  let player: GameObject;

  beforeEach(() => {
    keyboard = Keyboard.create();
    keyboard.attach();
    engineState = {
      screenBuffer: ScreenBuffer.create(LAYER_COUNT),
      keyboard,
      soundPlayer: {} as IEngineState['soundPlayer'],
      musicPlayer: {} as IEngineState['musicPlayer'],
      deltaTime: 1,
      fps: 0,
      addGameObject: () => {},
      removeGameObject: () => {},
      getGameObjectsAtPosition: () => [],
    };

    const tileMapGameObject = GameObject.create('Map', engineState, { x: 0, y: 0 }, [(go) => TileMap.create(go)]);
    const tileMap = tileMapGameObject.getScript(TileMap)!;

    player = GameObject.create('Player', engineState, { x: 8, y: 16 }, [
      (go) => KeyboardInputScript.create(go),
      (go) => StateScript.create(go, tileMap, Lives.create(2), { x: 8, y: 16 }),
    ]);
    player.start();
    stateScript = player.getScript(StateScript)!;
  });

  afterEach(() => {
    keyboard.detach();
  });

  it('calls forceLeft while ArrowLeft is held', () => {
    const forceLeft = vi.spyOn(stateScript, 'forceLeft');
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));

    player.update();

    expect(forceLeft).toHaveBeenCalledTimes(1);
  });

  it('calls forceRight while ArrowRight is held', () => {
    const forceRight = vi.spyOn(stateScript, 'forceRight');
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));

    player.update();

    expect(forceRight).toHaveBeenCalledTimes(1);
  });

  it('calls forceUp while ArrowUp is held', () => {
    const forceUp = vi.spyOn(stateScript, 'forceUp');
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));

    player.update();

    expect(forceUp).toHaveBeenCalledTimes(1);
  });

  it('calls forceDown while ArrowDown is held', () => {
    const forceDown = vi.spyOn(stateScript, 'forceDown');
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown' }));

    player.update();

    expect(forceDown).toHaveBeenCalledTimes(1);
  });

  it('calls none of the force methods when no key is held', () => {
    const forceLeft = vi.spyOn(stateScript, 'forceLeft');
    const forceRight = vi.spyOn(stateScript, 'forceRight');
    const forceUp = vi.spyOn(stateScript, 'forceUp');
    const forceDown = vi.spyOn(stateScript, 'forceDown');

    player.update();

    expect(forceLeft).not.toHaveBeenCalled();
    expect(forceRight).not.toHaveBeenCalled();
    expect(forceUp).not.toHaveBeenCalled();
    expect(forceDown).not.toHaveBeenCalled();
  });
});
