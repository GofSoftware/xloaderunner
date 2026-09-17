import { EmitterColor } from './emitter-color';

import { Direction } from '../direction';

export interface IBeamSegmentDescriptor {
  id: number;
  column: number;
  row: number;
  prevColumn: number;
  prevRow: number;
  color: EmitterColor;
  direction: Direction;
  prevDirection: Direction | null;
  afterCollision: boolean;
  overDirectionChanger: boolean;
}
