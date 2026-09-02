import { Script } from '../../engine/game-object/script';
import { GameObject } from '../../engine/game-object/game-object';
import { IBeamSegmentDescriptor } from './emitter/i-beam-segment-descriptor';
import { Direction } from './state/state-types';
import { EmitterColor } from './emitter/emitter-color';

export class BeamScript extends Script {
  public static create(gameObject: GameObject, segments: IBeamSegmentDescriptor): BeamScript {
    return new BeamScript(gameObject, segments);
  }

  private readonly segments: IBeamSegmentDescriptor;

  protected constructor(gameObject: GameObject, segments: IBeamSegmentDescriptor) {
    super(gameObject);
    this.segments = segments;
  }

  public get direction(): Direction {
    return this.segments.direction;
  }

  public get color(): EmitterColor {
    return this.segments.color;
  }

  public get afterCollision(): boolean {
    return this.segments.afterCollision;
  }
}
