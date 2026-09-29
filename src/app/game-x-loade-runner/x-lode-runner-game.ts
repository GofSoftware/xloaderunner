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
import { BACKGROUND_LAYER, HUD_LAYER } from '../engine/screen/screen.constants';
import { HeartsRenderer } from './scripts/hearts-renderer';
import { LivesScript } from './scripts/lives-script';
import { MAX_LIVES } from './x-lode-runner-constants';
import { TileType } from './scripts/tile-map/tile-map-types';

export class XLodeRunnerGame implements IGame {
  public static create(): XLodeRunnerGame {
    return new XLodeRunnerGame();
  }

  private _engineState: IEngineState | null = null;
  private get engineState(): IEngineState {
    if (this._engineState == null) {
      throw new Error('EngineState is not initialized');
    }
    return this._engineState!;
  }

  private levels: ((engineState: IEngineState) => ILevel)[] = [(engineState: IEngineState) => XLodeRunnerLevel1.create(engineState)];
  private lives: number = MAX_LIVES;

  private constructor() {}

  public async start(engineState: IEngineState): Promise<void> {
    this._engineState = engineState;

    await this.startLevel(
      StartMenuLevel.create(this.engineState, () => {
        this.startLevel(this.levels[0](this.engineState));
      }),
    );
  }

  public async startLevel(level: ILevel): Promise<void> {
    this.engineState.reset();

    const gameObjects = await level.initialize();
    [
      GameObject.create('Lives', this.engineState, { x: 0, y: 0 }, [
        (gameObject: GameObject) =>
          LivesScript.create(gameObject, this.lives, () => {
            this.lives--;
            this.lives > 0
              ? this.startLevel(level)
              : this.startLevel(
                  GameOverLevel.create(this.engineState, () => {
                    this.lives = MAX_LIVES;
                    this.startLevel(
                      StartMenuLevel.create(this.engineState, () => {
                        this.startLevel(this.levels[0](this.engineState));
                      }),
                    );
                  }),
                );
          }),
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
