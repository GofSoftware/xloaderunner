import { CELL_SIZE } from '../screen/screen.constants';

export class MapHelper {
  static screenToMap(x: number, y: number): { column: number; row: number } {
    return { column: Math.floor(x / CELL_SIZE), row: Math.floor(y / CELL_SIZE) };
  }

  static mapToScreen(column: number, row: number): { x: number; y: number } {
    return { x: column * CELL_SIZE, y: row * CELL_SIZE };
  }
}
