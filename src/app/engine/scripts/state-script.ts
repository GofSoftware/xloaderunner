import { Script } from '../game-object/script';
import { GameObject } from '../game-object/game-object';
import { BitmapSpriteRenderer } from './bitmap-sprite-renderer';
import { Keyboard } from '../keyboard/keyboard';
import { TileMap, TileType } from './tile-map';
import { BACKGROUND_LAYER, CELL_SIZE, FOREGROUND_LAYER, SCREEN_HEIGHT, SCREEN_WIDTH } from '../screen/screen.constants';
import {
  CLIMB_ANIMATION,
  FALL_ANIMATION,
  MOVE_ANIMATION_LEFT,
  MOVE_ANIMATION_RIGHT,
  ON_CROSSBAR_ANIMATION,
  ON_CROSSBAR_MOVE_LEFT_ANIMATION,
  ON_CROSSBAR_MOVE_RIGHT_ANIMATION,
  ON_STAIRS_ANIMATION,
  STAND_ANIMATION,
} from './animations';
import { BitmapRenderer } from './bitmap-renderer';
import { OBJECT_EXCLAMATION } from '../../data/sprites';
import { DestroyAfterTime } from './destroy-after-time';
import { TextRenderer } from './text-renderer';
import { DEATH_JINGLE } from '../audio/music-player';
import { Lives } from '../lives';

export enum PlayerState {
  Stand = 'Stand',
  MoveLeft = 'MoveLeft',
  MoveRight = 'MoveRight',
  MoveUp = 'MoveUp',
  MoveDown = 'MoveDown',
  Fall = 'Fall',
  OnStairs = 'OnStairs',
  OnCrossbar = 'OnCrossbar',
  OnCrossbarMoveLeft = 'OnCrossbarMoveLeft',
  OnCrossbarMoveRight = 'OnCrossbarMoveRight',
  Dying = 'Dying',
  GameOver = 'GameOver',
}

const MOVE_SPEED = 40;
const FALL_SPEED = 60;
const LEDGE_HESITATION_SECONDS = 0.3;
const DYING_DURATION_SECONDS = 1;
const ANIMATION_BY_STATE: Record<PlayerState, { frames: number[][][]; framesPerSecond: number }> = {
  [PlayerState.Stand]: STAND_ANIMATION,
  [PlayerState.MoveLeft]: MOVE_ANIMATION_LEFT,
  [PlayerState.MoveRight]: MOVE_ANIMATION_RIGHT,
  [PlayerState.MoveUp]: CLIMB_ANIMATION,
  [PlayerState.MoveDown]: CLIMB_ANIMATION,
  [PlayerState.Fall]: FALL_ANIMATION,
  [PlayerState.OnStairs]: ON_STAIRS_ANIMATION,
  [PlayerState.OnCrossbar]: ON_CROSSBAR_ANIMATION,
  [PlayerState.OnCrossbarMoveLeft]: ON_CROSSBAR_MOVE_LEFT_ANIMATION,
  [PlayerState.OnCrossbarMoveRight]: ON_CROSSBAR_MOVE_RIGHT_ANIMATION,
  // Reuses STAND_ANIMATION as a placeholder - no dedicated death/game-over art yet.
  [PlayerState.Dying]: STAND_ANIMATION,
  [PlayerState.GameOver]: STAND_ANIMATION,
};

export class StateScript extends Script {
  public static create(
    gameObject: GameObject,
    tileMap: TileMap,
    lives: Lives,
    spawnPosition: { x: number; y: number },
  ): StateScript {
    return new StateScript(gameObject, tileMap, lives, spawnPosition);
  }

  private static readonly STEP_SPEED: Record<PlayerState, number> = {
    [PlayerState.Stand]: 0,
    [PlayerState.MoveLeft]: MOVE_SPEED,
    [PlayerState.MoveRight]: MOVE_SPEED,
    [PlayerState.MoveUp]: MOVE_SPEED,
    [PlayerState.MoveDown]: MOVE_SPEED,
    [PlayerState.Fall]: FALL_SPEED,
    [PlayerState.OnStairs]: 0,
    [PlayerState.OnCrossbar]: 0,
    [PlayerState.OnCrossbarMoveLeft]: MOVE_SPEED,
    [PlayerState.OnCrossbarMoveRight]: MOVE_SPEED,
    [PlayerState.Dying]: 0,
    [PlayerState.GameOver]: 0,
  };

  private readonly tileMap: TileMap;
  private readonly lives: Lives;
  private readonly spawnPosition: { x: number; y: number };
  private state: PlayerState | undefined;
  private activeStep: { state: PlayerState; target: { x: number; y: number } } | undefined;
  private hesitation:
    | { state: PlayerState.MoveLeft | PlayerState.MoveRight; key: string; elapsed: number; warned: boolean }
    | undefined;
  private dying: { elapsed: number } | undefined;

  private constructor(gameObject: GameObject, tileMap: TileMap, lives: Lives, spawnPosition: { x: number; y: number }) {
    super(gameObject);
    this.tileMap = tileMap;
    this.lives = lives;
    this.spawnPosition = spawnPosition;
  }

  public override update(): void {
    if (this.state === PlayerState.GameOver) {
      return;
    }

    let activeState: PlayerState;
    if (this.activeStep) {
      activeState = this.activeStep.state;
    } else {
      activeState = this.resolveState();
      if (StateScript.STEP_SPEED[activeState] > 0) {
        this.activeStep = { state: activeState, target: this.computeStepTarget(activeState) };
      }
    }

    if (this.activeStep) {
      this.advanceStep();
    }

    this.setState(activeState);
  }

  private resolveState(): PlayerState {
    const { x, y } = this.gameObject.position;

    if (this.dying) {
      return this.advanceDying();
    }
    if (this.tileMap.isDangerousAtPixel(x, y)) {
      return this.beginDying();
    }

    const onStairs = this.isOnStairs();
    const onCrossbar = this.isOnCrossbar();

    if (!onStairs && !onCrossbar && !this.isGroundedBelow()) {
      this.hesitation = undefined;
      return PlayerState.Fall;
    }

    const { keyboard } = this.gameObject.engineState;
    if (!onCrossbar) {
      const groundMove = this.resolveGroundMove(keyboard);
      if (groundMove) {
        return groundMove;
      }
    } else {
      this.hesitation = undefined;
      if (keyboard.isPressed('ArrowLeft') && !this.tileMap.isWallAtPixel(x - CELL_SIZE, y)) {
        return PlayerState.OnCrossbarMoveLeft;
      }
      if (keyboard.isPressed('ArrowRight') && !this.tileMap.isWallAtPixel(x + CELL_SIZE, y)) {
        return PlayerState.OnCrossbarMoveRight;
      }
    }

    if (onStairs && keyboard.isPressed('ArrowUp') && !this.tileMap.isWallAtPixel(x, y - CELL_SIZE)) {
      return PlayerState.MoveUp;
    }
    if (keyboard.isPressed('ArrowDown') && !this.tileMap.isWallAtPixel(x, y + CELL_SIZE)) {
      return PlayerState.MoveDown;
    }

    if (onStairs) {
      return PlayerState.OnStairs;
    }
    if (onCrossbar) {
      return PlayerState.OnCrossbar;
    }
    return PlayerState.Stand;
  }

  private resolveGroundMove(keyboard: Keyboard): PlayerState | undefined {
    if (!this.hesitation || this.hesitation.warned) {
      const attempt = this.beginGroundMove(keyboard);
      if (attempt !== PlayerState.Stand || !this.hesitation || this.hesitation.warned) {
        return attempt;
      }
    }

    this.hesitation!.elapsed += this.gameObject.engineState.deltaTime;
    if (this.hesitation!.elapsed < LEDGE_HESITATION_SECONDS) {
      return PlayerState.Stand;
    }
    const { state, key } = this.hesitation!;
    // Keep remembering this direction as a single-use skip for the next attempt,
    // instead of clearing it outright - see startGroundMove.
    this.hesitation = { state, key, elapsed: 0, warned: true };
    return keyboard.isPressed(key) ? state : PlayerState.Stand;
  }

  private beginGroundMove(keyboard: Keyboard): PlayerState | undefined {
    const { x, y } = this.gameObject.position;

    if (keyboard.isPressed('ArrowLeft') && !this.tileMap.isWallAtPixel(x - CELL_SIZE, y)) {
      return this.startGroundMove(PlayerState.MoveLeft, 'ArrowLeft', x - CELL_SIZE, y);
    }
    if (keyboard.isPressed('ArrowRight') && !this.tileMap.isWallAtPixel(x + CELL_SIZE, y)) {
      return this.startGroundMove(PlayerState.MoveRight, 'ArrowRight', x + CELL_SIZE, y);
    }

    return undefined;
  }

  private startGroundMove(
    state: PlayerState.MoveLeft | PlayerState.MoveRight,
    key: string,
    targetX: number,
    targetY: number,
  ): PlayerState {
    if (!this.tileMap.isDangerousAtPixel(targetX, targetY + CELL_SIZE)) {
      this.hesitation = undefined;
      return state;
    }

    // Already hesitated for this direction once - move straight through this
    // time, but the skip is single-use: consume it so a further encounter
    // (in this or any other direction) hesitates again.
    if (this.hesitation?.state === state && this.hesitation.warned) {
      this.hesitation = undefined;
      return state;
    }

    this.hesitation = { state, key, elapsed: 0, warned: false };
    this.showExclamation();
    return PlayerState.Stand;
  }

  private beginDying(): PlayerState {
    this.hesitation = undefined;
    this.dying = { elapsed: 0 };
    const { musicPlayer } = this.gameObject.engineState;
    musicPlayer.register('Death', DEATH_JINGLE);
    musicPlayer.play('Death');
    return PlayerState.Dying;
  }

  private advanceDying(): PlayerState {
    this.dying!.elapsed += this.gameObject.engineState.deltaTime;
    if (this.dying!.elapsed < DYING_DURATION_SECONDS) {
      return PlayerState.Dying;
    }
    this.dying = undefined;
    return this.respawnOrEndGame();
  }

  private respawnOrEndGame(): PlayerState {
    this.lives.loseLife();
    if (this.lives.isGameOver) {
      this.showGameOver();
      return PlayerState.GameOver;
    }
    this.gameObject.setPosition(this.spawnPosition.x, this.spawnPosition.y);
    return PlayerState.Stand;
  }

  private showGameOver(): void {
    const gameOverText = GameObject.create(
      'GameOverText',
      this.gameObject.engineState,
      { x: 96, y: 88 },
      [(gameObject: GameObject) => TextRenderer.create(gameObject, 'GAME OVER', FOREGROUND_LAYER)],
    );
    this.gameObject.engineState.addGameObject(gameOverText);
  }

  private isGroundedBelow(): boolean {
    const { x, y } = this.gameObject.position;
    return this.tileMap.isSolidAtPixel(x, y + CELL_SIZE);
  }

  private isOnStairs(): boolean {
    const { x, y } = this.gameObject.position;
    return this.tileMap.getTileAtPixel(x, y) === TileType.Stairs;
  }

  private isOnCrossbar(): boolean {
    const { x, y } = this.gameObject.position;
    return this.tileMap.getTileAtPixel(x, y) === TileType.Crossbar;
  }

  private computeStepTarget(state: PlayerState): { x: number; y: number } {
    const { x, y } = this.gameObject.position;
    let targetX = x;
    let targetY = y;

    switch (state) {
      case PlayerState.MoveLeft:
        targetX = x - CELL_SIZE;
        break;
      case PlayerState.MoveRight:
        targetX = x + CELL_SIZE;
        break;
      case PlayerState.OnCrossbarMoveLeft:
        targetX = x - CELL_SIZE;
        break;
      case PlayerState.OnCrossbarMoveRight:
        targetX = x + CELL_SIZE;
        break;
      case PlayerState.MoveUp:
        targetY = y - CELL_SIZE;
        break;
      case PlayerState.MoveDown:
      case PlayerState.Fall:
        targetY = y + CELL_SIZE;
        break;
      case PlayerState.Stand:
      case PlayerState.OnStairs:
      case PlayerState.OnCrossbar:
      case PlayerState.Dying:
      case PlayerState.GameOver:
        break;
    }

    return {
      x: StateScript.clamp(targetX, 0, SCREEN_WIDTH - CELL_SIZE),
      y: StateScript.clamp(targetY, 0, SCREEN_HEIGHT - CELL_SIZE),
    };
  }

  private advanceStep(): void {
    const { deltaTime } = this.gameObject.engineState;
    const { x, y } = this.gameObject.position;
    const { state, target } = this.activeStep!;
    const distance = StateScript.STEP_SPEED[state] * deltaTime;

    const nextX = StateScript.moveToward(x, target.x, distance);
    const nextY = StateScript.moveToward(y, target.y, distance);
    this.gameObject.setPosition(nextX, nextY);

    if (nextX === target.x && nextY === target.y) {
      this.activeStep = undefined;
    }
  }

  private static moveToward(current: number, target: number, maxDelta: number): number {
    if (current < target) {
      return Math.min(current + maxDelta, target);
    }
    if (current > target) {
      return Math.max(current - maxDelta, target);
    }
    return target;
  }

  private static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private setState(state: PlayerState): void {
    if (this.state === state) {
      return;
    }
    this.state = state;

    const spriteRenderer = this.gameObject.getScript(BitmapSpriteRenderer);
    if (!spriteRenderer) {
      return;
    }

    const animation = ANIMATION_BY_STATE[this.state];
    spriteRenderer.setAnimation(animation.frames, animation.framesPerSecond);
  }

  private showExclamation(): void {
    const exclamation = GameObject.create(
      'ExclamationWarning',
      this.gameObject.engineState,
      { x: this.gameObject.position.x, y: this.gameObject.position.y - CELL_SIZE - 1 },
      [
        (gameObject: GameObject) => BitmapRenderer.create(gameObject, OBJECT_EXCLAMATION, BACKGROUND_LAYER),
        (gameObject: GameObject) => DestroyAfterTime.create(gameObject, 200),
      ],
    );
    this.gameObject.engineState.addGameObject(exclamation);
  }
}
