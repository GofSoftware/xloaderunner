import { IVector2 } from './i-vector-2';

export class Vector2 implements IVector2 {
  public static create(x: number, y: number): Vector2 {
    return new Vector2(x, y);
  }
  public static fromVectorLike(vectorLike: {x: number, y: number}): Vector2 {
    return new Vector2(vectorLike.x, vectorLike.y);
  }

  private static _zero: Vector2 | null = null;
  public static get zero(): Readonly<Vector2> {
    return this._zero || (this._zero = new Vector2(0, 0));
  }

  public x: number = 0;
  public y: number = 0;

  private constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }


  public add(vector: IVector2): Vector2 {
    return Vector2.create(this.x + vector.x, this.y + vector.y);
  }
}
