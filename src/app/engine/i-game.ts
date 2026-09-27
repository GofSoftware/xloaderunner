import { IEngineState } from './i-engine-state';

export interface IGame {
  start(engineState: IEngineState): Promise<void>;
  onMoseMove(x: number, y: number): void;
}
