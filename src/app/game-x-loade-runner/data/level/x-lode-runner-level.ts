import { TileType } from '../../scripts/tile-map/tile-map-types';
import { ILevel } from '../../i-level';
import { IEngineState } from '../../../engine/i-engine-state';
import { GameObject } from '../../../engine/game-object/game-object';
import { ENEMY_SPEED_SLOWDOWN, EnemyScript } from '../../scripts/enemy-script';
import { RunnerScript } from '../../scripts/runner-script';
import { StateScript } from '../../scripts/state-script';
import { ObjectPosition } from '../../scripts/object-position';
import { BitmapSpriteRenderer } from '../../../engine/scripts/renderer/bitmap-sprite-renderer';
import { STAND_ANIMATION } from '../../../engine/scripts/animations';
import { FOREGROUND_LAYER, HUD_LAYER } from '../../../engine/screen/screen.constants';
import { PlayerScript } from '../../scripts/player-script';
import { KeyboardInputScript } from '../../../engine/scripts/keyboard-input-script';
import { BuilderScript } from '../../scripts/builder-script';
import { BlastedBrickScript } from '../../scripts/blasted-brick-script';
import { GoldScript } from '../../scripts/gold-script';
import { TileMap } from '../../scripts/tile-map/tile-map';
import { createTileGameObject } from '../../tile-bitmap-factory';
import { IMapPosition } from '../../scripts/tile-map/i-map-position';
import { IVector2 } from '../../../engine/math/i-vector-2';
import { MapHelper } from '../../helpers/map.helper';
import { EmitterManager } from '../../scripts/emitter/emitter-manager';
import { PortalManagerScript } from '../../scripts/portal-manager-script';

export abstract class XLodeRunnerLevel implements ILevel {
  public engineState: IEngineState;
  public abstract map: TileType[][];
  public abstract initialize(): Promise<GameObject[]>;

  protected constructor(engineState: IEngineState) {
    this.engineState = engineState;
  }

  protected setup(): GameObject[] {
    const { tileMap, tileGameObjects, mapGameObject } = this.setupTileMap();
    const playerPosition = this.getPositionAndClear(tileMap, TileType.PlayerStart);
    const enemyPosition = this.getPositionAndClear(tileMap, TileType.EnemyStart);

    return [
      GameObject.create('Emitters', this.engineState, { x: 0, y: 0 }, [(gameObject: GameObject) => EmitterManager.create(gameObject)]),
      GameObject.create('PortalManager', this.engineState, { x: 0, y: 0 }, [
        (gameObject: GameObject) => PortalManagerScript.create(gameObject),
      ]),
      mapGameObject,
      ...tileGameObjects,
      this.createPlayer(playerPosition),
      this.createEnemy(enemyPosition),
    ];
  }

  protected setupTileMap(): { tileMap: TileMap; tileGameObjects: GameObject[]; mapGameObject: GameObject } {
    const mapGameObject = GameObject.create('Map', this.engineState, { x: 0, y: 0 }, [
      (gameObject: GameObject) => TileMap.create(gameObject),
    ]);
    const tileMap = mapGameObject.getScript(TileMap)!;

    this.map.forEach((value, y) => {
      value.forEach((type, x) => {
        tileMap.setTile(x, y, type);
      });
    });

    const tileGameObjects = tileMap
      .getTiles()
      .map(({ column, row, type }) => createTileGameObject(this.engineState, column, row, type))
      .filter((gameObject): gameObject is GameObject => gameObject !== undefined);
    return { tileMap, tileGameObjects, mapGameObject };
  }

  private createPlayer(playerPosition: { mapPosition: IMapPosition; screenPosition: IVector2 }): GameObject {
    return GameObject.create('Player', this.engineState, playerPosition.screenPosition, [
      (gameObject: GameObject) => PlayerScript.create(gameObject),
      (gameObject: GameObject) => KeyboardInputScript.create(gameObject),
      (gameObject: GameObject) => RunnerScript.create(gameObject),
      // Reads the player's cell before StateScript/ObjectPosition can move it this same frame - otherwise,
      // when the same arrow key both moves the player and specifies a build direction, the build target
      // would be computed from the cell the player is moving into rather than the cell it started this frame in.
      (gameObject: GameObject) => BuilderScript.create(gameObject, HUD_LAYER),
      (gameObject: GameObject) => BlastedBrickScript.create(gameObject),
      (gameObject: GameObject) => StateScript.create(gameObject, playerPosition.mapPosition),
      (gameObject: GameObject) => ObjectPosition.create(gameObject, playerPosition.mapPosition.column, playerPosition.mapPosition.row),
      (gameObject: GameObject) => GoldScript.create(gameObject, FOREGROUND_LAYER),
      (gameObject: GameObject) =>
        BitmapSpriteRenderer.create(
          gameObject,
          { bitmap: STAND_ANIMATION.frames, framePerSecond: STAND_ANIMATION.framesPerSecond },
          HUD_LAYER,
        ),
    ]);
  }

  private createEnemy(enemyPosition: { mapPosition: IMapPosition; screenPosition: IVector2 }): GameObject {
    return GameObject.create('Enemy', this.engineState, enemyPosition.screenPosition, [
      (gameObject: GameObject) => EnemyScript.create(gameObject),
      (gameObject: GameObject) => RunnerScript.create(gameObject),
      (gameObject: GameObject) => StateScript.create(gameObject, enemyPosition.mapPosition, 1 / ENEMY_SPEED_SLOWDOWN, true),
      (gameObject: GameObject) => ObjectPosition.create(gameObject, enemyPosition.mapPosition.column, enemyPosition.mapPosition.row),
      (gameObject: GameObject) =>
        BitmapSpriteRenderer.create(
          gameObject,
          { bitmap: STAND_ANIMATION.frames, framePerSecond: STAND_ANIMATION.framesPerSecond },
          HUD_LAYER,
          [(color: number) => color & 0xff5a5aff],
        ),
    ]);
  }

  private getPositionAndClear(
    tileMap: TileMap,
    type: TileType,
    defaultPosition: IMapPosition = { column: 0, row: 0 },
  ): { mapPosition: IMapPosition; screenPosition: IVector2 } {
    const startTile = tileMap.getTiles().find((tile) => tile.type === type);
    const spawnCell = startTile ? { column: startTile.column, row: startTile.row } : defaultPosition;
    const spawnPosition = MapHelper.mapToScreen(spawnCell.column, spawnCell.row);
    // PlayerStart/EnemyStart have no bitmap and never renders anything, but the tile grid still remembers it as
    // non-Empty - clear it, so BuilderScript can build on the spawn cell once the player has moved off it.
    tileMap.setTile(spawnCell.column, spawnCell.row, TileType.Empty);
    return { mapPosition: spawnCell, screenPosition: spawnPosition };
  }
}
