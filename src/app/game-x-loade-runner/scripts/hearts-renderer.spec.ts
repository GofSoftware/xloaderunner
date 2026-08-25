import { HeartsRenderer } from './hearts-renderer';
import { LivesScript, MAX_LIVES } from './lives-script';
import { GameObject } from '../../engine/game-object/game-object';
import { ScreenBuffer } from '../../engine/screen/screen-buffer';
import { CELL_SIZE, SCREEN_WIDTH } from '../../engine/screen/screen.constants';
import { OBJECT_HEART } from '../data/sprites';
import { IEngineState } from '../../engine/i-engine-state';

describe('HeartsRenderer', () => {
  const startX = SCREEN_WIDTH - MAX_LIVES * CELL_SIZE;

  function createEngineState(): IEngineState {
    return { screenBuffer: ScreenBuffer.create(1) } as IEngineState;
  }

  function heartAt(engineState: IEngineState, index: number): number[][] {
    const x = startX + index * CELL_SIZE;
    return engineState.screenBuffer.buffers[0].slice(0, 8).map((row) => row.slice(x, x + CELL_SIZE));
  }

  it('should draw one heart per remaining life, right-anchored in the top row', () => {
    const engineState = createEngineState();
    const gameObject = GameObject.create('Lives', engineState, { x: 0, y: 0 }, [
      (go) => LivesScript.create(go, 3),
      (go) => HeartsRenderer.create(go, 0),
    ]);

    gameObject.update();

    expect(heartAt(engineState, 0)).toEqual(OBJECT_HEART);
    expect(heartAt(engineState, 1)).toEqual(OBJECT_HEART);
    expect(heartAt(engineState, 2)).toEqual(OBJECT_HEART);
  });

  it('should draw fewer hearts as lives decrease', () => {
    const engineState = createEngineState();
    const gameObject = GameObject.create('Lives', engineState, { x: 0, y: 0 }, [
      (go) => LivesScript.create(go, 2),
      (go) => HeartsRenderer.create(go, 0),
    ]);
    gameObject.getScript(LivesScript)!.loseLife();

    gameObject.update();

    expect(heartAt(engineState, 0)).toEqual(OBJECT_HEART);
    expect(heartAt(engineState, 1)).toEqual(OBJECT_HEART.map((row) => row.map(() => 0)));
  });

  it('should draw onto the given layer only', () => {
    const engineState = { screenBuffer: ScreenBuffer.create(2) } as IEngineState;
    const gameObject = GameObject.create('Lives', engineState, { x: 0, y: 0 }, [
      (go) => LivesScript.create(go, 1),
      (go) => HeartsRenderer.create(go, 1),
    ]);

    gameObject.update();

    expect(engineState.screenBuffer.buffers[1].slice(0, 8).map((row) => row.slice(startX, startX + CELL_SIZE))).toEqual(OBJECT_HEART);
    expect(engineState.screenBuffer.buffers[0].slice(0, 8).map((row) => row.slice(startX, startX + CELL_SIZE))).toEqual(
      OBJECT_HEART.map((row) => row.map(() => 0)),
    );
  });
});
