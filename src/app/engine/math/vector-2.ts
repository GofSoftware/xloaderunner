import { IVector2 } from './i-vector-2';

export class Vector2 implements IVector2 {
  public static create(x: number, y: number): Vector2 {
    return new Vector2(x, y);
  }

  public x: number = 0;
  public y: number = 0;

  private constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
