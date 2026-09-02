import { Script } from '../../../engine/game-object/script';
import { GameObject } from '../../../engine/game-object/game-object';
import { TileMap } from '../tile-map/tile-map';
import { MapHelper } from '../../helpers/map.helper';
import { ObjectPosition } from '../object-position';
import { StateScript } from '../state-script';
import { BitmapRenderer } from '../../../engine/scripts/bitmap-renderer';
import { TILE_BITMAPS } from '../../tile-bitmap-factory';
import { MirrorDirection, ORDERED_MIRROR_TILES } from './mirror-types';
import { Direction } from '../state/state-types';

const PLAYER_NEARBY_DISTANCE = [
  { x: 0, y: 1 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: -1, y: 0 },
];

export class MirrorScript extends Script {
  public static create(gameObject: GameObject): MirrorScript {
    return new MirrorScript(gameObject);
  }

  private constructor(gameObject: GameObject) {
    super(gameObject);
  }

  private get tileMap(): TileMap {
    return this.gameObject.engineState.getGameObjectByName('Map')!.getScript(TileMap)!;
  }

  public override start() {
    super.start();
    const { column, row } = MapHelper.screenToMap(this.gameObject.position.x, this.gameObject.position.y);
    const tile = this.tileMap.getTile(column, row);
    if (!ORDERED_MIRROR_TILES.includes(tile as MirrorDirection)) {
      console.warn(`MirrorScript: ${this.gameObject.name} is not a mirror (tile: ${tile})`);
    }
  }

  public override update(): void {
    super.update();
    if (this.gameObject.engineState.keyboard.wasPressedThisFrame('Space')) {
      if (!this.hasPlayerNearby()) {
        return;
      }

      const { column, row } = MapHelper.screenToMap(this.gameObject.position.x, this.gameObject.position.y);
      let tile = this.tileMap.getTile(column, row);
      if (ORDERED_MIRROR_TILES.includes(tile as MirrorDirection)) {
        tile = ORDERED_MIRROR_TILES[(ORDERED_MIRROR_TILES.indexOf(tile as MirrorDirection) + 1) % ORDERED_MIRROR_TILES.length];
        this.tileMap.setTile(column, row, tile);
      }
      const mirrorObject = this.tileMap.getObjectsAt(column, row).find((gameObject) => gameObject.getScript(MirrorScript) != null);
      if (mirrorObject == null) {
        return;
      }
      const bitmap = TILE_BITMAPS[tile]?.staticBitmap;
      if (bitmap == null) {
        return;
      }
      mirrorObject.getScript(BitmapRenderer)?.setBitmap(bitmap);
    }
  }

  private hasPlayerNearby(): boolean {
    const { column, row } = MapHelper.screenToMap(this.gameObject.position.x, this.gameObject.position.y);
    const playerPosition = this.gameObject.engineState.getGameObjectByName('Player')?.getScript(ObjectPosition);
    const playerState = this.gameObject.engineState.getGameObjectByName('Player')?.getScript(StateScript);
    if (playerPosition == null || playerState == null) {
      return false;
    }

    const shift = PLAYER_NEARBY_DISTANCE.find(
      (offset) => column + offset.x === playerPosition.column && row + offset.y === playerPosition.row,
    );
    if (shift == null) {
      return false;
    }

    return (
      (shift.x === 0 && shift.y === 1 && playerState.direction === Direction.Up) ||
      (shift.x === 0 && shift.y === -1 && playerState.direction === Direction.Down) ||
      (shift.x === 1 && shift.y === 0 && playerState.direction === Direction.Left) ||
      (shift.x === -1 && shift.y === 0 && playerState.direction === Direction.Right)
    );
  }
}
