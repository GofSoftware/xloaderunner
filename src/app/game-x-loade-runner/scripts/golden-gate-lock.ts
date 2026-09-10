import { GameObject } from '../../engine/game-object/game-object';
import { Script } from '../../engine/game-object/script';
import { OnOffScript } from './on-off-script';
import { TileMap } from './tile-map/tile-map';
import { MapHelper } from '../helpers/map.helper';
import { TileType } from './tile-map/tile-map-types';
import { BitmapSpriteRenderer } from '../../engine/scripts/renderer/bitmap-sprite-renderer';
import { BitmapAnimationDirection } from '../../engine/scripts/i-bitmap-animation-description';
import { IMapPosition } from './tile-map/i-map-position';

export class GoldenGateLock extends Script {
  public static create(gameObject: GameObject, onOfLocation: IMapPosition): GoldenGateLock {
    return new GoldenGateLock(gameObject, onOfLocation);
  }

  private readonly onOfLocation: IMapPosition;
  private prevState: boolean | null = null;

  private constructor(gameObject: GameObject, onOfLocation: IMapPosition) {
    super(gameObject);
    this.onOfLocation = onOfLocation;
  }

  public override update(): void {
    const { column, row } = MapHelper.screenToMap(this.gameObject.position.x, this.gameObject.position.y);
    const onOf = this.tileMap
      .getObjectsAt(this.onOfLocation.column, this.onOfLocation.row)
      .find((o) => o.getScript(OnOffScript) != null)
      ?.getScript(OnOffScript);

    const state = onOf?.on ?? false;

    if (this.prevState !== state) {
      if (state) {
        this.tileMap.setTile(column, row, TileType.Empty);
        this.gameObject.getScript(BitmapSpriteRenderer)?.setAnimation({
          direction: BitmapAnimationDirection.Forward,
        });
      } else {
        this.tileMap.setTile(column, row, TileType.GoldenGates);
        this.gameObject.getScript(BitmapSpriteRenderer)?.setAnimation({
          direction: BitmapAnimationDirection.Backward,
        });
      }
    }
    this.prevState = state;
  }

  private get tileMap(): TileMap {
    return this.gameObject.engineState.getGameObjectByName('Map')!.getScript(TileMap)!;
  }
}
