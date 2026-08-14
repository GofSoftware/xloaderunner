import { Script } from '../game-object/script';
import { GameObject } from '../game-object/game-object';
import { Vector2 } from '../math/vector-2';

export class LinearMoveScript extends Script {
  public static create(gameObject: GameObject, vector: Vector2, speed: number): LinearMoveScript {
    return new LinearMoveScript(gameObject, vector, speed);
  }

  constructor(
    gameObject: GameObject,
    private vector: Vector2,
    private speed: number,
  ) {
    super(gameObject);
  }

  public override update(): void {
    const length = Math.sqrt(this.vector.x * this.vector.x + this.vector.y * this.vector.y);
    if (length === 0) {
      return;
    }
    const nx = this.vector.x / length;
    const ny = this.vector.y / length;
    const { x, y } = this.gameObject.position;
    const nextX = x + nx * this.speed * this.gameObject.engineState.deltaTime;
    const nextY = y + ny * this.speed * this.gameObject.engineState.deltaTime;
    this.gameObject.setPosition(nextX, nextY);
  }
}
