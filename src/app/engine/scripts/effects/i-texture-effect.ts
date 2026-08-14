import { IEngineState } from '../../i-engine-state';

export interface ITextureEffect {
  isEnabled: boolean;
  apply(texture: number[][]): number[][];
}

export abstract class TextureEffect {
  public isEnabled: boolean = true;

  public constructor(protected enginesState: IEngineState) {}

  public abstract apply(texture: number[][]): number[][];
}
