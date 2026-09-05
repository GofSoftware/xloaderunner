export enum BitmapAnimationDirection {
  Forward = 'Forward',
  Backward = 'Backward'
}

export interface IBitmapAnimationDescription {
  bitmap?: number[][][];
  framePerSecond?: number;
  spriteIndexTime?: number;
  oneTime?: boolean;
  direction?: BitmapAnimationDirection
}
