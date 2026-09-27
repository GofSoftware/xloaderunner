import { IEngineState } from '../engine/i-engine-state';
import { TileType } from './scripts/tile-map/tile-map-types';
import { GameObject } from '../engine/game-object/game-object';

export interface ILevel {
  engineState: IEngineState;
  map: TileType[][];

  initialize(): Promise<GameObject[]>;
}
