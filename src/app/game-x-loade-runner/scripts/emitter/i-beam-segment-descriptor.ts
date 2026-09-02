import { EmitterColor } from './emitter-color';
import { Direction } from '../state/state-types';

export interface IBeamSegmentDescriptor {
  id: number;
  column: number;
  row: number;
  prevColumn: number;
  prevRow: number;
  color: EmitterColor;
  direction: Direction;
  afterCollision: boolean;
  overDirectionChanger: boolean;
}
