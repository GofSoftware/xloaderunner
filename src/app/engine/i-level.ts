import { IEngineState } from './i-engine-state';

export interface ILevel {
  initialize(engineState: IEngineState): Promise<void>;
  onMoseMove(x: number, y: number): void;
}
