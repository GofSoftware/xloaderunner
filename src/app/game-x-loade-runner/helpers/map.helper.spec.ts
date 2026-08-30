import { MapHelper } from './map.helper';
import { CELL_SIZE } from '../../engine/screen/screen.constants';

describe('MapHelper', () => {
  describe('screenToMap', () => {
    it('should floor pixel coordinates down to the containing cell', () => {
      expect(MapHelper.screenToMap(20, 35)).toEqual({ column: 2, row: 4 });
      expect(MapHelper.screenToMap(0, 0)).toEqual({ column: 0, row: 0 });
    });

    it('should divide exactly by the cell size for grid-aligned pixels', () => {
      expect(MapHelper.screenToMap(CELL_SIZE * 3, CELL_SIZE * 5)).toEqual({ column: 3, row: 5 });
    });
  });

  describe('mapToScreen', () => {
    it('should scale cell coordinates up to their top-left pixel', () => {
      expect(MapHelper.mapToScreen(3, 5)).toEqual({ x: 24, y: 40 });
      expect(MapHelper.mapToScreen(0, 0)).toEqual({ x: 0, y: 0 });
    });
  });

  it('should round-trip a grid-aligned pixel through screenToMap and mapToScreen', () => {
    const { column, row } = MapHelper.screenToMap(40, 56);
    expect(MapHelper.mapToScreen(column, row)).toEqual({ x: 40, y: 56 });
  });
});
