import { GameObject } from '../../engine/game-object/game-object';
import { Script } from '../../engine/game-object/script';
import { OnOffScript } from './on-off-script';
import { TileMap } from './tile-map/tile-map';
import { MapHelper } from '../helpers/map.helper';
import { TileType } from './tile-map/tile-map-types';
import { BitmapSpriteRenderer } from '../../engine/scripts/renderer/bitmap-sprite-renderer';

export class GoldenGateLock extends Script {
  public static create(gameObject: GameObject, column: number, row: number): GoldenGateLock {
    return new GoldenGateLock(gameObject, column, row);
  }

  private readonly column: number;
  private readonly row: number;
  private prevState: boolean | null = null;

  private constructor(gameObject: GameObject, column: number, row: number) {
    super(gameObject);
    this.column = column;
    this.row = row;
  }

  public override update(): void {
    const onOf = this.tileMap
      .getObjectsAt(this.column, this.row)
      .find((o) => o.getScript(OnOffScript) != null)
      ?.getScript(OnOffScript);
    if (onOf) {
      const { column, row } = MapHelper.screenToMap(this.gameObject.position.x, this.gameObject.position.y);
      if (this.prevState !== onOf.on) {
        if (onOf.on) {
          this.tileMap.setTile(column, row, TileType.Empty);
          this.gameObject.getScript(BitmapSpriteRenderer)?.setAnimation({ spriteIndexTime: 0 });
        } else {
          this.tileMap.setTile(column, row, TileType.GoldenGates);
          this.gameObject.getScript(BitmapSpriteRenderer)?.setAnimation({ spriteIndexTime: 0 });
        }
      }
      this.prevState = onOf.on;
    }
  }

  private get tileMap(): TileMap {
    return this.gameObject.engineState.getGameObjectByName('Map')!.getScript(TileMap)!;
  }
}
