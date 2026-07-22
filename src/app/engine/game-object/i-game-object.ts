import { IVector2 } from '../math/i-vector-2';
import { IEngineState } from '../i-engine-state';

export interface IGameObject {
  engineState: IEngineState;
  position: IVector2;
}
