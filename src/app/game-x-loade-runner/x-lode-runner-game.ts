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
import { Tile } from './scripts/tile-map/tile-map-types';
import { XLodeRunnerLevel2 } from './data/level/x-lode-runner-level-2';
import { Vector2 } from '../engine/math/vector-2';

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

  private levels: ((engineState: IEngineState) => ILevel)[] = [
    (engineState: IEngineState) => XLodeRunnerLevel2.create(engineState),
    (engineState: IEngineState) => XLodeRunnerLevel1.create(engineState)
  ];
  private currentLevelIndex: number = 0;
  private lives: number = MAX_LIVES;

  private constructor() {}

  public async start(engineState: IEngineState): Promise<void> {
    this._engineState = engineState;

    await this.startLevel(
      StartMenuLevel.create(this.engineState, () => {
        this.startLevel(0);
      }),
    );
  }

  public async startLevel(level: ILevel | number): Promise<void> {
    this.engineState.reset();
    let isPlayableLevel = false;
    if (typeof level === 'number') {
      isPlayableLevel = true;
      level = this.levels[level](this.engineState);
    }

    const gameObjects = await level.initialize();
    [
      ...(isPlayableLevel ? [this.createLives()] : []),
      GameObject.create('Stars', this.engineState, Vector2.zero, [
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
    if (tile === Tile.Empty && objects.length === 0) {
      return;
    }
    console.log(`Screen coords: x ${screenX} y ${screenY} Map coords: column ${column} row ${row}; Tile: ${tile}`, objects);
  }

  private createLives(): GameObject {
    return GameObject.create('Lives', this.engineState, Vector2.zero, [
      (gameObject: GameObject) =>
        LivesScript.create(gameObject, this.lives, () => {
            this.lives--;
            this.lives > 0
              ? this.startLevel(this.currentLevelIndex)
              : this.startGameOverLevel()
          },
          () => this.startNextLevel()
        ),
      (gameObject: GameObject) => HeartsRenderer.create(gameObject, HUD_LAYER),
    ]);
  }

  private async startMenuLevel(): Promise<void> {
    this.lives = MAX_LIVES;
    this.currentLevelIndex = 0;
    await this.startLevel(
      StartMenuLevel.create(this.engineState, () => this.startLevel(this.currentLevelIndex))
    );
  }

  private async startGameOverLevel(): Promise<void> {
    await this.startLevel(
      GameOverLevel.create(this.engineState, () => this.startMenuLevel()));
  }

  private async startNextLevel(): Promise<void> {
    if (++this.currentLevelIndex >= this.levels.length) {
      return await this.startGameOverLevel();
    }
    await this.startLevel(this.currentLevelIndex);
  }
}
