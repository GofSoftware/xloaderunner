import { ScreenBuffer } from './screen/screen-buffer';
import { LAYER_COUNT } from './screen/screen.constants';
import { Keyboard } from './keyboard/keyboard';
import { GameObject } from './game-object/game-object';
import { IEngineState } from './i-engine-state';
import { SoundPlayer } from './audio/sound-player';
import { MusicPlayer, TWINKLE_TWINKLE_LITTLE_STAR } from './audio/music-player';
import { ILevel } from './i-level';

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
  public timeFromStart: number = 0;
  public startedAt: number = 0;
  public get level(): ILevel { if (this.levelInstance == null) throw new Error('Level not set'); return this.levelInstance!;}

  private fpsFrameCount: number = 0;
  private fpsElapsedTime: number = 0;
  private levelInstance: ILevel | null  = null;

  private constructor() {
    this.screenBuffer = ScreenBuffer.create(LAYER_COUNT);
    this.keyboard = Keyboard.create();
    this.soundPlayer = SoundPlayer.create();
    this.musicPlayer = MusicPlayer.create(this.soundPlayer);
  }

  public setRender(uiRender: (buffers: ReadonlyArray<Readonly<number[][]>>) => void): void {
    this.uiRender = uiRender;
  }

  public async start(level: ILevel): Promise<void> {
    this.previousFrameTime = Date.now();
    this.startedAt = Date.now();
    this.started = true;
    this.keyboard.attach();
    this.gameObjects = [];
    this.gameObjectsByName.clear();
    this.levelInstance = level;
    await this.level.initialize(this);
    this.render();
  }

  public stop(): void {
    this.started = false;
    this.keyboard.detach();
    // removeGameObject() removes the object from this.gameObjects, so iterate a copy -
    // forEach over the live array would skip every other element as it shrinks.
    [...this.gameObjects].forEach((gameObject) => this.removeGameObject(gameObject));
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

    gameObject.start();
  }

  public removeGameObject(gameObject: GameObject): void {
    const index = this.gameObjects.indexOf(gameObject);
    if (index >= 0) {
      this.gameObjects.splice(index, 1);
    }

    const named = this.gameObjectsByName.get(gameObject.name);
    if (named) {
      const namedIndex = named.indexOf(gameObject);
      if (namedIndex >= 0) {
        named.splice(namedIndex, 1);
      }
      if (named.length === 0) {
        this.gameObjectsByName.delete(gameObject.name);
      }
    }

    if (!gameObject.isDestroyed) {
      gameObject.destroy();
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
    this.timeFromStart = Date.now() - this.startedAt;
    this.updateFps();
    this.screenBuffer.clear();

    // removeGameObject() (e.g. GoldScript collecting an item) removes a game object from
    // this.gameObjects mid-frame, so iterate a copy - forEach over the live
    // array would skip whichever element shifts into the just-processed slot.
    [...this.gameObjects].forEach((gameObject) => gameObject.update());

    if (this.keyboard.wasPressedThisFrame('Enter')) {
      this.soundPlayer.play(440, 0.1);
    }

    if (this.keyboard.wasPressedThisFrame('KeyT')) {
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

}
