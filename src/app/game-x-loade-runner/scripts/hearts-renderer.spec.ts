import { HeartsRenderer } from './hearts-renderer';
import { LivesScript } from './lives-script';
import { MAX_LIVES } from '../x-lode-runner-constants';
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
      (go) => LivesScript.create(go, MAX_LIVES, () => {}),
      (go) => HeartsRenderer.create(go, 0),
    ]);

    gameObject.update();

    for (let i = 0; i < MAX_LIVES; i++) {
      expect(heartAt(engineState, i)).toEqual(OBJECT_HEART);
    }
  });

  // LivesScript no longer decrements its own count - loseLife() just defers to
  // XLodeRunnerGame, which recreates the whole level (and a fresh LivesScript/HeartsRenderer
  // pair) with the new count. So "fewer lives" here just means constructing with a lower count.
  it('should draw fewer hearts when constructed with a lower count', () => {
    const engineState = createEngineState();
    const gameObject = GameObject.create('Lives', engineState, { x: 0, y: 0 }, [
      (go) => LivesScript.create(go, MAX_LIVES - 1, () => {}),
      (go) => HeartsRenderer.create(go, 0),
    ]);

    gameObject.update();

    for (let i = 0; i < MAX_LIVES - 1; i++) {
      expect(heartAt(engineState, i)).toEqual(OBJECT_HEART);
    }
    expect(heartAt(engineState, MAX_LIVES - 1)).toEqual(OBJECT_HEART.map((row) => row.map(() => 0)));
  });

  it('should draw onto the given layer only', () => {
    const engineState = { screenBuffer: ScreenBuffer.create(2) } as IEngineState;
    const gameObject = GameObject.create('Lives', engineState, { x: 0, y: 0 }, [
      (go) => LivesScript.create(go, 1, () => {}),
      (go) => HeartsRenderer.create(go, 1),
    ]);

    gameObject.update();

    expect(engineState.screenBuffer.buffers[1].slice(0, 8).map((row) => row.slice(startX, startX + CELL_SIZE))).toEqual(OBJECT_HEART);
    expect(engineState.screenBuffer.buffers[0].slice(0, 8).map((row) => row.slice(startX, startX + CELL_SIZE))).toEqual(
      OBJECT_HEART.map((row) => row.map(() => 0)),
    );
  });
});
