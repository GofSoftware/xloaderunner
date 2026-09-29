import { ILevel } from '../../i-level';
import { IEngineState } from '../../../engine/i-engine-state';
import { GameObject } from '../../../engine/game-object/game-object';
import { TileType } from '../../scripts/tile-map/tile-map-types';
import { CELL_SIZE, HUD_LAYER } from '../../../engine/screen/screen.constants';
import { TextRenderer } from '../../../engine/scripts/text-renderer';
import { ColorOverrideTextureEffect } from '../../../engine/scripts/effects/color-override-texture-effect';
import { StartMenuScript } from '../../scripts/start/start-menu-script';
import { VoidCallback } from './start-menu-level';

export class GameOverLevel implements ILevel {
  public static create(engineState: IEngineState, continueCallback: VoidCallback): GameOverLevel {
    return new GameOverLevel(engineState, continueCallback);
  }

  private readonly continueCallback: VoidCallback = () => {};
  public engineState: IEngineState;
  public map: TileType[][] = [[]];

  private constructor(engineState: IEngineState, continueCallback: VoidCallback) {
    this.engineState = engineState;
    this.continueCallback = continueCallback;
  }

  public async initialize(): Promise<GameObject[]> {
    const title = GameObject.create('Title', this.engineState, { x: CELL_SIZE * 11, y: CELL_SIZE * 9 }, [
      (gameObject: GameObject) =>
        TextRenderer.create(gameObject, 'Game Over', HUD_LAYER, [
          ColorOverrideTextureEffect.create(this.engineState, (v: number, x: number, y: number) => {
            const color = Math.abs(Math.sin((this.engineState.timeFromStart - x * 10) / 1000)) * 255;
            const result = (color << 8) | 0xffff00ff;
            return v & result;
          }),
        ]),
    ]);
    const anyKey = GameObject.create('Any Key', this.engineState, { x: CELL_SIZE * 4, y: CELL_SIZE * 11 }, [
      (gameObject: GameObject) =>
        TextRenderer.create(gameObject, 'Press Any Key To Continue', HUD_LAYER, [
          ColorOverrideTextureEffect.create(this.engineState, (v: number, x: number, y: number) => {
            const color = Math.abs(Math.sin(this.engineState.timeFromStart / 1000)) * 255;
            const result = (color << 8) | (color << 16) | (color << 24) | 0xff;
            return v & result;
          }),
        ]),
      (gameObject: GameObject) => StartMenuScript.create(gameObject, this.continueCallback),
    ]);

    return [title, anyKey];
  }
}
