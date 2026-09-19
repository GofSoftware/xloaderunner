import { Script } from '../../../engine/game-object/script';
import { GameObject } from '../../../engine/game-object/game-object';
import { TileMap } from '../tile-map/tile-map';
import { MapHelper } from '../../helpers/map.helper';
import { BitmapRenderer } from '../../../engine/scripts/renderer/bitmap-renderer';
import { creatTileGameObjectName, TILE_BITMAPS } from '../../tile-bitmap-factory';
import { MirrorDirection, ORDERED_MIRROR_TILES } from './mirror-types';

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

  public rotate(): void {
    const { column, row } = MapHelper.screenToMap(this.gameObject.position.x, this.gameObject.position.y);
    let tile = this.tileMap.getTile(column, row);
    if (ORDERED_MIRROR_TILES.includes(tile as MirrorDirection)) {
      tile = ORDERED_MIRROR_TILES[(ORDERED_MIRROR_TILES.indexOf(tile as MirrorDirection) + 1) % ORDERED_MIRROR_TILES.length];
      this.tileMap.setTile(column, row, tile);
      this.gameObject.engineState.renameGameObject(this.gameObject, creatTileGameObjectName(tile, column, row));
    }

    const bitmap = TILE_BITMAPS[tile]?.staticBitmap;
    if (bitmap == null) {
      return;
    }

    this.gameObject.getScript(BitmapRenderer)?.setBitmap(bitmap);
  }
}
