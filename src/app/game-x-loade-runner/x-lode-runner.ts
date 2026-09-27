import { XLodeRunnerLevel1 } from './data/level/x-lode-runner-level-1';
import { TileMap } from './scripts/tile-map/tile-map';
import { MapHelper } from './helpers/map.helper';
import { IEngineState } from '../engine/i-engine-state';
import { IGame } from '../engine/i-game';
import { ILevel } from './i-level';
import { GameOverLevel } from './data/level/game-over-level';
import { StartMenuLevel } from './data/level/start-menu-level';
import { GameObject } from '../engine/game-object/game-object';
import { BackgroundStars } from './scripts/background-stars';
import { BACKGROUND_LAYER, CELL_SIZE, HUD_LAYER } from '../engine/screen/screen.constants';
import { HeartsRenderer } from './scripts/hearts-renderer';
import { LivesScript } from './scripts/lives-script';
import { DissolveTextureEffect } from '../engine/scripts/effects/dissolve-texture-effect';
import { TextRenderer } from '../engine/scripts/text-renderer';
import { DestroyAfterTime } from '../engine/scripts/destroy-after-time';
import { LinearMoveScript } from '../engine/scripts/linear-move-script';
import { MAX_LIVES } from './x-lode-runner-constants';
import { TileType } from './scripts/tile-map/tile-map-types';

export class XLodeRunner implements IGame {
  public static create(): XLodeRunner {
    return new XLodeRunner();
  }

  private eState: IEngineState | null = null;
  private get engineState(): IEngineState {
    if (this.eState == null) {
      throw new Error('EngineState is not initialized');
    }
    return this.eState!;
  }

  private levels: ((engineState: IEngineState) => ILevel)[] = [(engineState: IEngineState) => XLodeRunnerLevel1.create(engineState)];
  private lives: number = MAX_LIVES;
  private currentLevel: ILevel | null = null;

  private constructor() {}

  public async start(engineState: IEngineState): Promise<void> {
    this.eState = engineState;

    if (this.currentLevel == null) {
      await this.startLevel(this.levels[0](this.engineState) /*StartMenuLevel.create(this.engineState)*/);
    } else if (this.lives <= 0) {
      await this.startLevel(GameOverLevel.create(this.engineState));
    } else if (this.lives > 0) {
      await this.startLevel(this.levels[0](this.engineState));
    } else {
      throw new Error('Game initialization failure: incorrect IGame state.');
    }
  }

  public async startLevel(level: ILevel): Promise<void> {
    const gameObjects = await level.initialize();
    [
      GameObject.create('Title', this.engineState, { x: CELL_SIZE * 10, y: CELL_SIZE * 2 }, [
        (gameObject: GameObject) => LinearMoveScript.create(gameObject, { x: 0, y: -1 }, 5),
        (gameObject: GameObject) => DestroyAfterTime.create(gameObject, 5000),
        (gameObject: GameObject) =>
          TextRenderer.create(gameObject, 'xLode Runner', HUD_LAYER, [DissolveTextureEffect.create(this.engineState, 0.5, (v) => v * v)]),
      ]),
      GameObject.create('Lives', this.engineState, { x: 0, y: 0 }, [
        (gameObject: GameObject) => LivesScript.create(gameObject, this.lives),
        (gameObject: GameObject) => HeartsRenderer.create(gameObject, HUD_LAYER),
      ]),
      GameObject.create('Stars', this.engineState, { x: 0, y: 0 }, [
        (gameObject: GameObject) => BackgroundStars.create(gameObject, BACKGROUND_LAYER),
      ]),
      ...gameObjects,
    ].forEach((gameObject) => this.engineState.addGameObject(gameObject));
  }

  public onMoseMove(screenX: number, screenY: number): void {
    this.logTiles(screenX, screenY);
  }

  private logTiles(screenX: number, screenY: number): void {
    const { column, row } = MapHelper.screenToMap(screenX, screenY);
    const mapGameObject = this.engineState.getGameObjectByName('Map')?.getScript(TileMap);
    if (mapGameObject == null) {
      return;
    }
    const tile = mapGameObject.getTile(column, row);
    const objects = mapGameObject.getObjectsAt(column, row);
    if (tile === TileType.Empty && objects.length === 0) {
      return;
    }
    console.log(`Screen coords: x ${screenX} y ${screenY} Map coords: column ${column} row ${row}; Tile: ${tile}`, objects);
  }
}
