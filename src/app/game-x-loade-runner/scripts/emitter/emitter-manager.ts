import { Script } from '../../../engine/game-object/script';
import { GameObject } from '../../../engine/game-object/game-object';
import { TileMap } from '../tile-map/tile-map';
import { Direction, StateScript } from '../state-script';
import { MapHelper } from '../../helpers/map.helper';
import { EmitterColor } from './emitter-color';
import type { EmitterScript } from './emitter-script';
import { Mg, UPPER_EFFECT_LAYER } from '../../../engine/screen/screen.constants';
import { OBJECT_BEAM_HORIZONTAL_1, OBJECT_BEAM_HORIZONTAL_2, OBJECT_BEAM_VERTICAL_1, OBJECT_BEAM_VERTICAL_2 } from '../../data/sprites';
import { BitmapSpriteRenderer } from '../../../engine/scripts/bitmap-sprite-renderer';
import { TileType } from '../tile-map/tile-map-types';
import { MirrorHelper } from '../mirror/mirror-helper';

const STEP_BY_DIRECTION: Record<Direction, { column: number; row: number }> = {
  [Direction.Left]: { column: -1, row: 0 },
  [Direction.Right]: { column: 1, row: 0 },
  [Direction.Up]: { column: 0, row: -1 },
  [Direction.Down]: { column: 0, row: 1 },
};

const HORIZONTAL_BEAM: number[][][] = [OBJECT_BEAM_HORIZONTAL_1/*, OBJECT_BEAM_HORIZONTAL_2*/];
const VERTICAL_BEAM: number[][][] = [OBJECT_BEAM_VERTICAL_1/*, OBJECT_BEAM_VERTICAL_2*/];

const STEPS_PER_SEC = 50;

interface IBeamSegmentDescriptor {
  id: number;
  column: number;
  row: number;
  color: EmitterColor;
  direction: Direction;
  afterCollision: boolean;
  overDirectionChanger: boolean;
  gameObject: GameObject;
}

export class EmitterManager extends Script {
  public static create(gameObject: GameObject, layer: number = UPPER_EFFECT_LAYER): EmitterManager {
    return new EmitterManager(gameObject, layer);
  }

  private readonly layer: number;
  private readonly emitters = new Set<EmitterScript>();
  private readonly beamSegments = new Map<number, IBeamSegmentDescriptor>();
  private startedAt = 0;
  private stepsPassed = 0;
  private _id = 0;

  private constructor(gameObject: GameObject, layer: number) {
    super(gameObject);
    this.layer = layer;
  }

  private get tileMap(): TileMap {
    return this.gameObject.engineState.getGameObjectByName('Map')!.getScript(TileMap)!;
  }

  public register(emitter: EmitterScript): void {
    this.emitters.add(emitter);
  }

  public unregister(emitter: EmitterScript): void {
    this.emitters.delete(emitter);
  }

  public override start(): void {
    this.startedAt = this.gameObject.engineState.timeFromStart;
  }

  public override update(): void {
    const stepNumber = Math.ceil((this.gameObject.engineState.timeFromStart - this.startedAt) / (1000 / STEPS_PER_SEC));
    if (stepNumber < 0) {
      return;
    }

    const stepsToCalculate = stepNumber - this.stepsPassed;
    if (stepsToCalculate <= 0) {
      return;
    }

    for (let i = 0; i < stepsToCalculate; i++) {
      this.processStep();
    }

    this.stepsPassed += stepsToCalculate;
  }

  public override destroy(): void {}

  private createBeamSegment(id: number, column: number, row: number): GameObject {
    const { x, y } = MapHelper.mapToScreen(column, row);

    const beamGameObject = GameObject.create(`Beam-${id}-${EmitterManager.key(column, row)}`, this.gameObject.engineState, { x, y }, [
      (gameObject) => BitmapSpriteRenderer.create(gameObject, { bitmap: HORIZONTAL_BEAM, framePerSecond: 2 }, this.layer),
    ]);
    this.gameObject.engineState.addGameObject(beamGameObject);

    return beamGameObject;
  }

  private updateSegmentGameObject(descriptor: IBeamSegmentDescriptor): void {
    const bitmap = this.isHorizontal(descriptor.direction) ? HORIZONTAL_BEAM : VERTICAL_BEAM;
    const { x, y } = MapHelper.mapToScreen(descriptor.column, descriptor.row);
    const colorOverride = descriptor.afterCollision
      ? (c: number) => (0x00000000/*c === Mg ? 0x00000000 : c*/)
      : (c: number) => c & (descriptor.color === EmitterColor.Green ? 0x00ff00ff : 0x0000ffff);

    const gameObject = descriptor.gameObject;

    gameObject.setPosition(x, y);
    gameObject.getScript(BitmapSpriteRenderer)!.setAnimation({bitmap});
    gameObject.getScript(BitmapSpriteRenderer)!.setColorOverrides([colorOverride]);
  }

  private destroyBeamSegment(descriptor: IBeamSegmentDescriptor): void {
    this.gameObject.engineState.removeGameObject(descriptor.gameObject);
  }

  private processStep(): void {
    const beamSegmentsMap = new Map<string, IBeamSegmentDescriptor[]>();

    const newSegments = Array.from(this.emitters).map((emitter) => {
      const newId = ++this._id;
      const newSegment: IBeamSegmentDescriptor = {
        id: newId,
        row: emitter.row,
        column: emitter.column,
        color: emitter.color,
        direction: emitter.direction,
        afterCollision: false,
        overDirectionChanger: false,
        gameObject: this.createBeamSegment(newId, emitter.column, emitter.row),
      };
      this.beamSegments.set(newSegment.id, newSegment);
      return newSegment;
    });

    Array.from(this.beamSegments.values()).forEach((segment) => {
      EmitterManager.step(segment);

      if (this.isBlocked(segment.column, segment.row) ||
        !this.isInBounds(segment.column, segment.row) ||
        this.hasCharacterAt(segment.column, segment.row)
      ) {
        this.stopSegment(segment, newSegments);
        return;
      }

      const isBlockedByMirror = this.changeDirectionIfMirrored(segment);
      if (isBlockedByMirror) {
        this.stopSegment(segment, newSegments)
        return;
      }

      const key = EmitterManager.key(segment.column, segment.row);
      if (!beamSegmentsMap.has(key)) {
        beamSegmentsMap.set(key, []);
      }
      beamSegmentsMap.get(key)!.push(segment);
    });

    beamSegmentsMap.forEach((segments) => {
      if (segments.length > 1 && segments.filter((segment) => !segment.afterCollision).length > 1) {
        segments.forEach((segment) => {segment.afterCollision = true;});
      }
      segments.forEach((segment) => {
        this.updateSegmentGameObject(segment);
      });
    });

    newSegments.forEach((segment) => {
      segment.gameObject.update();
    })
  }

  private changeDirectionIfMirrored(segment: IBeamSegmentDescriptor): boolean {
    const mirrorTile = this.tileMap.getTile(segment.column, segment.row);
    if (!MirrorHelper.isMirror(mirrorTile)) {
      return false;
    }

    if (
      (segment.direction === Direction.Left && !(mirrorTile === TileType.MirrorRT || mirrorTile === TileType.MirrorRB)) ||
      (segment.direction === Direction.Right && !(mirrorTile === TileType.MirrorLT || mirrorTile === TileType.MirrorLB)) ||
      (segment.direction === Direction.Down && !(mirrorTile === TileType.MirrorLT || mirrorTile === TileType.MirrorRT)) ||
      (segment.direction === Direction.Up && !(mirrorTile === TileType.MirrorLB || mirrorTile === TileType.MirrorRB))
    ) {
      return true;
    }

    if (
      (segment.direction === Direction.Left && mirrorTile === TileType.MirrorRB) ||
      (segment.direction === Direction.Right && mirrorTile === TileType.MirrorLB)
    ) {
      segment.direction = Direction.Down;
    }

    if (
      (segment.direction === Direction.Left && mirrorTile === TileType.MirrorRT) ||
      (segment.direction === Direction.Right && mirrorTile === TileType.MirrorLT)
    ) {
      segment.direction = Direction.Up;
    }

    if (
      (segment.direction === Direction.Up && mirrorTile === TileType.MirrorRB) ||
      (segment.direction === Direction.Down && mirrorTile === TileType.MirrorRT)
    ) {
      segment.direction = Direction.Right;
    }

    if (
      (segment.direction === Direction.Up && mirrorTile === TileType.MirrorLB) ||
      (segment.direction === Direction.Down && mirrorTile === TileType.MirrorLT)
    ) {
      segment.direction = Direction.Left;
    }

    return false;
  }

  private static step(segment: IBeamSegmentDescriptor): void {
    const { column, row } = STEP_BY_DIRECTION[segment.direction];
    segment.column = segment.column + column;
    segment.row = segment.row + row;
  }

  private isBlocked(column: number, row: number): boolean {
    return (
      !this.isInBounds(column, row) ||
      this.tileMap.isWall(column, row) ||
      this.tileMap.isDangerous(column, row) ||
      this.hasCharacterAt(column, row)
    );
  }

  private isInBounds(column: number, row: number): boolean {
    return column >= 0 && column < this.tileMap.columns && row >= 0 && row < this.tileMap.rows;
  }

  private hasCharacterAt(column: number, row: number): boolean {
    return this.tileMap.getObjectsAt(column, row).some((gameObject) => gameObject.getScript(StateScript) !== undefined);
  }

  private static key(column: number, row: number): string {
    return `${column},${row}`;
  }

  private isHorizontal(direction: Direction): boolean {
    return direction === Direction.Left || direction === Direction.Right;
  }

  private stopSegment(segment: IBeamSegmentDescriptor, newSegments: IBeamSegmentDescriptor[]): void {
    this.beamSegments.delete(segment.id);
    this.destroyBeamSegment(segment);
    const newIndex = newSegments.findIndex((s) => s.id === segment.id);
    if (newIndex >= 0) {
      newSegments.splice(newIndex, 1);
    }
  }
}


