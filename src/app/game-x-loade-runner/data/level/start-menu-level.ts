import { ILevel } from '../../i-level';
import { IEngineState } from '../../../engine/i-engine-state';
import { GameObject } from '../../../engine/game-object/game-object';
import { TileType } from '../../scripts/tile-map/tile-map-types';

export class StartMenuLevel implements ILevel {
  public static create(engineState: IEngineState): StartMenuLevel {
    return new StartMenuLevel(engineState);
  }

  public engineState: IEngineState;
  public map: TileType[][] = [[]];

  private constructor(engineState: IEngineState) {
    this.engineState = engineState;
  }

  public async initialize(): Promise<GameObject[]> {
    return [];
  }
}
