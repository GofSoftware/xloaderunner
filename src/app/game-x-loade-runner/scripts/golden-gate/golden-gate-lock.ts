import { GameObject } from '../../../engine/game-object/game-object';
import { Script } from '../../../engine/game-object/script';
import { OnOffScript } from '../on-off/on-off-script';
import { TileMap } from '../tile-map/tile-map';
import { MapHelper } from '../../helpers/map.helper';
import { Tile } from '../tile-map/tile-map-types';
import { BitmapSpriteRenderer } from '../../../engine/scripts/renderer/bitmap-sprite-renderer';
import { BitmapAnimationDirection } from '../../../engine/scripts/i-bitmap-animation-description';
import { IGoldenGateLockOptions } from './i-golden-gate-lock-options';
import { OnOffManager } from '../on-off/on-off-manager';

export class GoldenGateLock extends Script {
  public static create(gameObject: GameObject, options: IGoldenGateLockOptions): GoldenGateLock {
    return new GoldenGateLock(gameObject, options);
  }

  private options: IGoldenGateLockOptions;
  private prevState: boolean | null = null;

  private _onOffScript: OnOffScript | null = null;
  private get onOff(): OnOffScript {
    if (this._onOffScript != null) {
      return this._onOffScript;
    }
    this._onOffScript = this.onOffManager.getOnOff(this.options.linkedOnOffScriptName) ?? null;
    if (this._onOffScript == null) {
      throw new Error(
        `${this.gameObject.name}: OnOffScript ${this.options.linkedOnOffScriptName} not found.`
      );
    }
    return this._onOffScript;
  }
  private get onOffManager(): OnOffManager {
    const onOffManager = this.gameObject.engineState.getGameObjectByName('OnOffManager')?.getScript(OnOffManager);
    if (onOffManager == null) {
      throw new Error(
        `${this.gameObject.name}: OnOffManager not found in the engine state.`
      );
    }
    return onOffManager;
  }

  private constructor(gameObject: GameObject, options: IGoldenGateLockOptions) {
    super(gameObject);
    this.options = options;
  }

  public override update(): void {
    const { column, row } = MapHelper.screenToMap(this.gameObject.position.x, this.gameObject.position.y);

    const state = this.onOff.on;

    if (this.prevState !== state) {
      if (state) {
        this.tileMap.setTile(column, row, Tile.Empty);
        this.gameObject.getScript(BitmapSpriteRenderer)?.setAnimation({
          direction: BitmapAnimationDirection.Forward,
        });
      } else {
        this.tileMap.setTile(column, row, Tile.GoldenGates);
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
