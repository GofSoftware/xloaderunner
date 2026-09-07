import { Script } from '../../engine/game-object/script';
import { TileMap } from './tile-map/tile-map';
import { StateScript } from './state-script';
import { GameObject } from '../../engine/game-object/game-object';
import { ObjectPosition } from './object-position';

export class BaseScript extends Script {

  private _tileMap: TileMap | null = null;
  private _playerState: StateScript | null = null;
  private _player: GameObject | null = null;
  private _playerPosition: ObjectPosition | null = null;

  protected get tileMap(): TileMap {
    return this._tileMap ?? (this._tileMap = this.gameObject.engineState.getGameObjectByName('Map')!.getScript(TileMap)!);
  }
  protected get playerState(): StateScript {
    return this._playerState ?? (this._playerState = this.gameObject.engineState.getGameObjectByName('Player')!.getScript(StateScript)!);
  }
  protected get player(): GameObject {
    return this._player ?? (this._player = this.gameObject.engineState.getGameObjectByName('Player')!);
  }
  protected get playerPosition(): ObjectPosition {
    return this._playerPosition ??
      (this._playerPosition = this.gameObject.engineState.getGameObjectByName('Player')!.getScript(ObjectPosition)!);
  }
}
