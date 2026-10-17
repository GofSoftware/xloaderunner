import { CELL_SIZE } from '../../engine/screen/screen.constants';
import { Vector2 } from '../../engine/math/vector-2';

export class MapHelper {
  static screenToMap(x: number, y: number): { column: number; row: number } {
    return { column: Math.floor(x / CELL_SIZE), row: Math.floor(y / CELL_SIZE) };
  }

  static mapToScreen(column: number, row: number): Vector2 {
    return Vector2.create(column * CELL_SIZE, row * CELL_SIZE);
  }
}
