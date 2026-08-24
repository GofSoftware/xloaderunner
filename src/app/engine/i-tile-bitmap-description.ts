import { IBitmapAnimationDescription } from './scripts/i-bitmap-animation-description';

export enum TileBitmapType {
  Static = 'Static',
  Animated = 'Animated',
}

export interface ITileBitmapDescription {
  bitmapType: TileBitmapType;
  animatedBitmap?: IBitmapAnimationDescription;
  staticBitmap?: number[][];
  /** Layer to render this tile on. Defaults to BACKGROUND_LAYER when omitted. */
  layer?: number;
}
