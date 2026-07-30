import { LETTER_A } from '../data/glyphs';
import { MAN_STANDING_FRAME_1, MAN_STANDING_FRAME_2, OBJECT_BRICK, OBJECT_STAIRS } from '../data/sprites';
import { LEVEL_TILES } from '../data/level';
import { ScreenBuffer } from './screen/screen-buffer';
import { CELL_SIZE, SCREEN_HEIGHT, SCREEN_WIDTH } from './screen/screen.constants';
import { Keyboard } from './keyboard/keyboard';
import { GameObject } from './game-object/game-object';
import { IEngineState } from './i-engine-state';
import { BitmapRenderer } from './scripts/bitmap-renderer';
import { BitmapSpriteRenderer } from './scripts/bitmap-sprite-renderer';
import { BackgroundStars } from './scripts/background-stars';
import { TileMap, TileType } from './scripts/tile-map';
import { StateScript } from './scripts/state-script';
import { SoundPlayer } from './audio/sound-player';
import { MusicPlayer, TWINKLE_TWINKLE_LITTLE_STAR } from './audio/music-player';
import { STAND_ANIMATION } from './scripts/animations';

const FRAME_RATE = 0;

export class Engine implements IEngineState {
  private static engineInstance: Engine;
  public static get instance(): Engine {
    return Engine.engineInstance ?? (Engine.engineInstance = new Engine());
  }

  private static readonly tileBitmaps: Partial<Record<TileType, number[][]>> = {
    [TileType.Brick]: OBJECT_BRICK,
    [TileType.Stairs]: OBJECT_STAIRS,
  };

  private uiRender: ((buffer: Readonly<number[][]>) => void) | undefined;
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
    this.screenBuffer = ScreenBuffer.create();
    this.keyboard = Keyboard.create();
    this.soundPlayer = SoundPlayer.create();
    this.musicPlayer = MusicPlayer.create(this.soundPlayer);
  }

  public setRender(uiRender: (buffer: Readonly<number[][]>) => void): void {
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
    this.gameObjects.forEach((gameObject) => gameObject.destroy());
  }

  private render(): void {
    if (!this.started) {
      return;
    }
    const currentFrameTime = Date.now();
    this.deltaTime = (currentFrameTime - this.previousFrameTime) / 1000;
    this.previousFrameTime = currentFrameTime;
    this.updateFps();

    this.gameObjects.forEach((gameObject) => gameObject.update());

    if (this.keyboard.wasPressedThisFrame('Enter')) {
      this.soundPlayer.play(440, 0.1);
    }

    if (this.keyboard.wasPressedThisFrame('Space')) {
      this.musicPlayer.register('Twinkle', TWINKLE_TWINKLE_LITTLE_STAR);
      this.musicPlayer.play('Twinkle');
    }

    this.uiRender && this.uiRender(this.screenBuffer.buffer);
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
    LEVEL_TILES.forEach(({ column, row, type }) => tileMap.setTile(column, row, type));

    const tileGameObjects = tileMap.getTiles().map(({ column, row, type }) =>
      GameObject.create(`Tile-${column}-${row}`, this, { x: column * CELL_SIZE, y: row * CELL_SIZE }, [
        (gameObject: GameObject) => BitmapRenderer.create(gameObject, Engine.tileBitmaps[type]!),
      ]),
    );

    this.gameObjects.push(
      mapGameObject,
      GameObject.create('Stars', this, { x: 0, y: 0 }, [(gameObject: GameObject) => BackgroundStars.create(gameObject)]),
      ...tileGameObjects,
      GameObject.create('LetterA', this, { x: 0, y: 0 }, [(gameObject: GameObject) => BitmapRenderer.create(gameObject, LETTER_A)]),

      GameObject.create('Player', this, { x: CELL_SIZE * 10, y: CELL_SIZE * 20 }, [
        (gameObject: GameObject) => StateScript.create(gameObject, tileMap),
        (gameObject: GameObject) => BitmapSpriteRenderer.create(gameObject, STAND_ANIMATION.frames, STAND_ANIMATION.framesPerSecond),
      ]),
    );

    this.gameObjects.forEach((gameObject) => gameObject.start());
  }
}
