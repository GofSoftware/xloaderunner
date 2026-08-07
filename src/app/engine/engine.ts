import {
  OBJECT_BRICK,
  OBJECT_CROSSBAR,
  OBJECT_GOLD,
  OBJECT_LAVA_1,
  OBJECT_LAVA_2,
  OBJECT_LAVA_3,
  OBJECT_LAVA_4,
  OBJECT_LAVA_5,
  OBJECT_LAVA_6,
  OBJECT_LAVA_7,
  OBJECT_LAVA_8,
  OBJECT_STAIRS,
} from '../data/sprites';
import { Lives } from './lives';
import { HeartsRenderer } from './scripts/hearts-renderer';
import { LEVEL_TILES_ARR } from '../data/level';
import { ScreenBuffer } from './screen/screen-buffer';
import { BACKGROUND_LAYER, CELL_SIZE, FOREGROUND_LAYER, LAYER_COUNT } from './screen/screen.constants';
import { Keyboard } from './keyboard/keyboard';
import { GameObject } from './game-object/game-object';
import { IEngineState } from './i-engine-state';
import { BitmapRenderer } from './scripts/bitmap-renderer';
import { BitmapSpriteRenderer } from './scripts/bitmap-sprite-renderer';
import { BackgroundStars } from './scripts/background-stars';
import { TileMap, TileType } from './scripts/tile-map';
import { StateScript } from './scripts/state-script';
import { GoldScript } from './scripts/gold-script';
import { GoldItem } from './scripts/gold-item';
import { TextRenderer } from './scripts/text-renderer';
import { SoundPlayer } from './audio/sound-player';
import { MusicPlayer, TWINKLE_TWINKLE_LITTLE_STAR } from './audio/music-player';
import { STAND_ANIMATION } from './scripts/animations';
import { ITileBitmapDescription, TileBitmapType } from './i-tile-bitmap-description';

const FRAME_RATE = 0;



export class Engine implements IEngineState {
  private static engineInstance: Engine;
  public static get instance(): Engine {
    return Engine.engineInstance ?? (Engine.engineInstance = new Engine());
  }

  private static readonly tileBitmaps: Partial<Record<TileType, ITileBitmapDescription>> = {
    [TileType.Brick]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_BRICK },
    [TileType.Stairs]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_STAIRS },
    [TileType.Crossbar]: { bitmapType: TileBitmapType.Static, staticBitmap: OBJECT_CROSSBAR },
    [TileType.Lava]: {
      bitmapType: TileBitmapType.Animated,
      animatedBitmap: {
        bitmap: [OBJECT_LAVA_1, OBJECT_LAVA_2, OBJECT_LAVA_3, OBJECT_LAVA_4, OBJECT_LAVA_5, OBJECT_LAVA_6, OBJECT_LAVA_7, OBJECT_LAVA_8],
        framePerSecond: 4,
      },
    },
  };

  private uiRender: ((buffers: ReadonlyArray<Readonly<number[][]>>) => void) | undefined;
  private started: boolean = false;
  private previousFrameTime: number = 0;
  private gameObjects: GameObject[] = [];

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
  }

  public removeGameObject(gameObject: GameObject): void {
    const index = this.gameObjects.indexOf(gameObject);
    if (index >= 0) {
      this.gameObjects.splice(index, 1);
    }
  }

  public getGameObjectsAtPosition(x: number, y: number): GameObject[] {
    return this.gameObjects.filter((gameObject) => gameObject.position.x === x && gameObject.position.y === y);
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

    const mapGameObject = GameObject.create('Map', this, { x: 0, y: 0 }, [(gameObject: GameObject) => TileMap.create(gameObject)]);
    const tileMap = mapGameObject.getScript(TileMap)!;

    LEVEL_TILES_ARR.forEach((value, y) => {
      value.forEach((type, x) => {
        tileMap.setTile(x, y, type);
      });
    });

    const tileGameObjects = tileMap
      .getTiles()
      .filter(({ type }) => type in Engine.tileBitmaps)
      .map(({ column, row, type }) =>
        GameObject.create(`Tile-${column}-${row}`, this, { x: column * CELL_SIZE, y: row * CELL_SIZE }, [
          (gameObject: GameObject) => {
            const tileBitmap = Engine.tileBitmaps[type]!;
            return tileBitmap.bitmapType === TileBitmapType.Static
              ? BitmapRenderer.create(gameObject, tileBitmap.staticBitmap!, BACKGROUND_LAYER)
              : BitmapSpriteRenderer.create(
                  gameObject,
                  {
                    bitmap: tileBitmap.animatedBitmap!.bitmap,
                    framePerSecond: tileBitmap.animatedBitmap!.framePerSecond,
                  },
                  BACKGROUND_LAYER,
                );
          },
        ]),
      );

    const goldGameObjects = tileMap
      .getTiles()
      .filter(({ type }) => type === TileType.Gold)
      .map(({ column, row }) =>
        GameObject.create(`Gold-${column}-${row}`, this, { x: column * CELL_SIZE, y: row * CELL_SIZE }, [
          (gameObject: GameObject) => GoldItem.create(gameObject),
          (gameObject: GameObject) => BitmapRenderer.create(gameObject, OBJECT_GOLD, BACKGROUND_LAYER),
        ]),
      );

    const startTile = tileMap.getTiles().find((tile) => tile.type === TileType.PlayerStart);
    const spawnPosition = startTile
      ? { x: startTile.column * CELL_SIZE, y: startTile.row * CELL_SIZE }
      : { x: CELL_SIZE * 20, y: CELL_SIZE * 5 };

    const lives = Lives.create();

    this.gameObjects.push(
      mapGameObject,
      GameObject.create('Stars', this, { x: 0, y: 0 }, [(gameObject: GameObject) => BackgroundStars.create(gameObject, BACKGROUND_LAYER)]),
      ...tileGameObjects,
      ...goldGameObjects,
      GameObject.create('Title', this, { x: 0, y: 0 }, [
        (gameObject: GameObject) => TextRenderer.create(gameObject, 'xLode Runner', BACKGROUND_LAYER),
      ]),
      GameObject.create('Lives', this, { x: 0, y: 0 }, [
        (gameObject: GameObject) => HeartsRenderer.create(gameObject, lives, FOREGROUND_LAYER),
      ]),

      GameObject.create('Player', this, spawnPosition, [
        (gameObject: GameObject) => StateScript.create(gameObject, tileMap, lives, spawnPosition),
        (gameObject: GameObject) => GoldScript.create(gameObject, FOREGROUND_LAYER),
        (gameObject: GameObject) =>
          BitmapSpriteRenderer.create(
            gameObject,
            { bitmap: STAND_ANIMATION.frames, framePerSecond: STAND_ANIMATION.framesPerSecond },
            FOREGROUND_LAYER,
          ),
      ]),
    );

    this.gameObjects.forEach((gameObject) => gameObject.start());
  }
}
