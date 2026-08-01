import { ISpriteBitmapDescription } from './scripts/i-sprite-bitmap-description';

export enum TileBitmapType {
  Static = 'Static',
  Animated = 'Animated'
}

export interface ITileBitmapDescription {
  bitmapType: TileBitmapType,
  animatedBitmap?: ISpriteBitmapDescription;
  staticBitmap?: number[][];
}
