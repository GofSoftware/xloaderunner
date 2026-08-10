import { OBJECT_GOLD } from '../data/sprites';
import { LivesScript } from './scripts/lives-script';
import { HeartsRenderer } from './scripts/hearts-renderer';
import { LEVEL_TILES_ARR } from '../data/level';
import { ScreenBuffer } from './screen/screen-buffer';
import { BACKGROUND_LAYER, FOREGROUND_LAYER, LAYER_COUNT } from './screen/screen.constants';
import { Keyboard } from './keyboard/keyboard';
import { GameObject } from './game-object/game-object';
import { IEngineState } from './i-engine-state';
import { BitmapRenderer } from './scripts/bitmap-renderer';
import { BitmapSpriteRenderer } from './scripts/bitmap-sprite-renderer';
import { BackgroundStars } from './scripts/background-stars';
import { TileMap, TileType } from './scripts/tile-map';
import { StateScript } from './scripts/state-script';
import { KeyboardInputScript } from './scripts/keyboard-input-script';
import { BuilderScript } from './scripts/builder-script';
import { GoldScript } from './scripts/gold-script';
import { GoldItem } from './scripts/gold-item';
import { ObjectPosition } from './scripts/object-position';
import { MapHelper } from './scripts/map.helper';
import { createTileGameObject } from './scripts/tile-bitmaps';
import { TextRenderer } from './scripts/text-renderer';
import { SoundPlayer } from './audio/sound-player';
import { MusicPlayer, TWINKLE_TWINKLE_LITTLE_STAR } from './audio/music-player';
import { STAND_ANIMATION } from './scripts/animations';

const FRAME_RATE = 0;

export class Engine implements IEngineState {
  private static engineInstance: Engine;
  public static get instance(): Engine {
    return Engine.engineInstance ?? (Engine.engineInstance = new Engine());
  }

  private uiRender: ((buffers: ReadonlyArray<Readonly<number[][]>>) => void) | undefined;
  private started: boolean = false;
  private previousFrameTime: number = 0;
  private gameObjects: GameObject[] = [];
  private gameObjectsByName: Map<string, GameObject[]> = new Map();

  public readonly screenBuffer: ScreenBuffer;
  public readonly keyboard: Keyboard;
  public readonly soundPlayer: SoundPlayer;
  public readonly musicPlayer: MusicPlayer;
  public deltaTime: number = 0;
  public fps: number = 0;

  private fpsFrameCount: number = 0;
  private fpsElapsedTime: number = 0;

  private constructor() {
    this.screenBuffer = ScreenBuffer.create(LAYER_COUNT);
    this.keyboard = Keyboard.create();
    this.soundPlayer = SoundPlayer.create();
    this.musicPlayer = MusicPlayer.create(this.soundPlayer);
  }

  public setRender(uiRender: (buffers: ReadonlyArray<Readonly<number[][]>>) => void): void {
    this.uiRender = uiRender;
  }

  public start(): void {
    this.previousFrameTime = Date.now();
    this.started = true;
    this.keyboard.attach();
    this.initLevel();
    this.render();
  }

  public stop(): void {
    this.started = false;
    this.keyboard.detach();
    // destroy() removes the object from this.gameObjects, so iterate a copy -
    // forEach over the live array would skip every other element as it shrinks.
    [...this.gameObjects].forEach((gameObject) => gameObject.destroy());
  }

  public addGameObject(gameObject: GameObject, after?: GameObject): void {
    const index = after ? this.gameObjects.indexOf(after) : -1;
    if (index >= 0) {
      this.gameObjects.splice(index + 1, 0, gameObject);
    } else {
      this.gameObjects.push(gameObject);
    }

    const named = this.gameObjectsByName.get(gameObject.name);
    if (named) {
      named.push(gameObject);
    } else {
      this.gameObjectsByName.set(gameObject.name, [gameObject]);
    }
  }

  public removeGameObject(gameObject: GameObject): void {
    const index = this.gameObjects.indexOf(gameObject);
    if (index >= 0) {
      this.gameObjects.splice(index, 1);
    }

    const named = this.gameObjectsByName.get(gameObject.name);
    if (!named) {
      return;
    }
    const namedIndex = named.indexOf(gameObject);
    if (namedIndex >= 0) {
      named.splice(namedIndex, 1);
    }
    if (named.length === 0) {
      this.gameObjectsByName.delete(gameObject.name);
    }
  }

  public getGameObjectByName(name: string): GameObject | undefined {
    return this.gameObjectsByName.get(name)?.[0];
  }

  private render(): void {
    if (!this.started) {
      return;
    }
    const currentFrameTime = Date.now();
    this.deltaTime = (currentFrameTime - this.previousFrameTime) / 1000;
    this.previousFrameTime = currentFrameTime;
    this.updateFps();
    this.screenBuffer.clear();

    // destroy() (e.g. GoldScript collecting an item) removes a game object from
    // this.gameObjects mid-frame, so iterate a copy - forEach over the live
    // array would skip whichever element shifts into the just-processed slot.
    [...this.gameObjects].forEach((gameObject) => gameObject.update());

    if (this.keyboard.wasPressedThisFrame('Enter')) {
      this.soundPlayer.play(440, 0.1);
    }

    if (this.keyboard.wasPressedThisFrame('Space')) {
      this.musicPlayer.register('Twinkle', TWINKLE_TWINKLE_LITTLE_STAR);
      this.musicPlayer.play('Twinkle');
    }

    this.uiRender && this.uiRender(this.screenBuffer.buffers);
    this.keyboard.next();
    setTimeout(() => this.render(), FRAME_RATE);
  }

  private updateFps(): void {
    this.fpsFrameCount++;
    this.fpsElapsedTime += this.deltaTime;
    if (this.fpsElapsedTime >= 1) {
      this.fps = this.fpsFrameCount / this.fpsElapsedTime;
      this.fpsFrameCount = 0;
      this.fpsElapsedTime = 0;
    }
  }

  private initLevel(): void {
    this.gameObjects = [];
    this.gameObjectsByName.clear();

    const mapGameObject = GameObject.create('Map', this, { x: 0, y: 0 }, [(gameObject: GameObject) => TileMap.create(gameObject)]);
    const tileMap = mapGameObject.getScript(TileMap)!;

    LEVEL_TILES_ARR.forEach((value, y) => {
      value.forEach((type, x) => {
        tileMap.setTile(x, y, type);
      });
    });

    const tileGameObjects = tileMap
      .getTiles()
      .map(({ column, row, type }) => createTileGameObject(this, column, row, type))
      .filter((gameObject): gameObject is GameObject => gameObject !== undefined);

    const goldGameObjects = tileMap
      .getTiles()
      .filter(({ type }) => type === TileType.Gold)
      .map(({ column, row }) =>
        GameObject.create(`Gold-${column}-${row}`, this, MapHelper.mapToScreen(column, row), [
          (gameObject: GameObject) => ObjectPosition.create(gameObject, column, row),
          (gameObject: GameObject) => GoldItem.create(gameObject),
          (gameObject: GameObject) => BitmapRenderer.create(gameObject, OBJECT_GOLD, BACKGROUND_LAYER),
        ]),
      );

    const startTile = tileMap.getTiles().find((tile) => tile.type === TileType.PlayerStart);
    const spawnCell = startTile ? { column: startTile.column, row: startTile.row } : { column: 20, row: 5 };
    const spawnPosition = MapHelper.mapToScreen(spawnCell.column, spawnCell.row);

    [
      mapGameObject,
      GameObject.create('Stars', this, { x: 0, y: 0 }, [(gameObject: GameObject) => BackgroundStars.create(gameObject, BACKGROUND_LAYER)]),
      ...tileGameObjects,
      ...goldGameObjects,
      GameObject.create('Title', this, { x: 0, y: 0 }, [
        (gameObject: GameObject) => TextRenderer.create(gameObject, 'xLode Runner', BACKGROUND_LAYER),
      ]),
      GameObject.create('Lives', this, { x: 0, y: 0 }, [
        (gameObject: GameObject) => LivesScript.create(gameObject),
        (gameObject: GameObject) => HeartsRenderer.create(gameObject, FOREGROUND_LAYER),
      ]),

      GameObject.create('Player', this, spawnPosition, [
        (gameObject: GameObject) => KeyboardInputScript.create(gameObject),
        // Reads the player's cell before StateScript/ObjectPosition can move it this same frame - otherwise,
        // when the same arrow key both moves the player and specifies a build direction, the build target
        // would be computed from the cell the player is moving into rather than the cell it started this frame in.
        (gameObject: GameObject) => BuilderScript.create(gameObject),
        (gameObject: GameObject) => StateScript.create(gameObject, spawnCell),
        (gameObject: GameObject) => ObjectPosition.create(gameObject, spawnCell.column, spawnCell.row),
        (gameObject: GameObject) => GoldScript.create(gameObject, FOREGROUND_LAYER),
        (gameObject: GameObject) =>
          BitmapSpriteRenderer.create(
            gameObject,
            { bitmap: STAND_ANIMATION.frames, framePerSecond: STAND_ANIMATION.framesPerSecond },
            FOREGROUND_LAYER,
          ),
      ]),
    ].forEach((gameObject) => this.addGameObject(gameObject));

    this.gameObjects.forEach((gameObject) => gameObject.start());
  }
}
