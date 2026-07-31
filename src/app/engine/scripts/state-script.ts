import { Script } from '../game-object/script';
import { GameObject } from '../game-object/game-object';
import { BitmapSpriteRenderer } from './bitmap-sprite-renderer';
import { TileMap, TileType } from './tile-map';
import { CELL_SIZE, FOREGROUND_LAYER, SCREEN_HEIGHT, SCREEN_WIDTH } from '../screen/screen.constants';
import { OBJECT_EMPTY } from '../../data/sprites';
import {
  CLIMB_ANIMATION,
  FALL_ANIMATION,
  MOVE_ANIMATION_LEFT,
  MOVE_ANIMATION_RIGHT,
  ON_STAIRS_ANIMATION,
  STAND_ANIMATION,
} from './animations';

export enum PlayerState {
  Stand = 'Stand',
  MoveLeft = 'MoveLeft',
  MoveRight = 'MoveRight',
  MoveUp = 'MoveUp',
  MoveDown = 'MoveDown',
  Fall = 'Fall',
  OnStairs = 'OnStairs',
}

const MOVE_SPEED = 40;
const FALL_SPEED = 60;
const ANIMATION_BY_STATE: Record<PlayerState, { frames: number[][][]; framesPerSecond: number }> = {
  [PlayerState.Stand]: STAND_ANIMATION,
  [PlayerState.MoveLeft]: MOVE_ANIMATION_LEFT,
  [PlayerState.MoveRight]: MOVE_ANIMATION_RIGHT,
  [PlayerState.MoveUp]: CLIMB_ANIMATION,
  [PlayerState.MoveDown]: CLIMB_ANIMATION,
  [PlayerState.Fall]: FALL_ANIMATION,
  [PlayerState.OnStairs]: ON_STAIRS_ANIMATION,
};

export class StateScript extends Script {
  public static create(gameObject: GameObject, tileMap: TileMap): StateScript {
    return new StateScript(gameObject, tileMap);
  }

  private static readonly STEP_SPEED: Record<PlayerState, number> = {
    [PlayerState.Stand]: 0,
    [PlayerState.MoveLeft]: MOVE_SPEED,
    [PlayerState.MoveRight]: MOVE_SPEED,
    [PlayerState.MoveUp]: MOVE_SPEED,
    [PlayerState.MoveDown]: MOVE_SPEED,
    [PlayerState.Fall]: FALL_SPEED,
    [PlayerState.OnStairs]: 0,
  };

  private readonly gameObject: GameObject;
  private readonly tileMap: TileMap;
  private state: PlayerState | undefined;
  private activeStep: { state: PlayerState; target: { x: number; y: number } } | undefined;

  private constructor(gameObject: GameObject, tileMap: TileMap) {
    super();
    this.gameObject = gameObject;
    this.tileMap = tileMap;
  }

  public override update(): void {
    const previousPosition = { x: this.gameObject.position.x, y: this.gameObject.position.y };

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
    this.clearPreviousPosition(previousPosition);
  }

  private resolveState(): PlayerState {
    const onStairs = this.isOnStairs();

    if (!onStairs && !this.isGroundedBelow()) {
      return PlayerState.Fall;
    }

    const { keyboard } = this.gameObject.engineState;
    if (keyboard.isPressed('ArrowLeft')) {
      return PlayerState.MoveLeft;
    }
    if (keyboard.isPressed('ArrowRight')) {
      return PlayerState.MoveRight;
    }
    if (onStairs && keyboard.isPressed('ArrowUp')) {
      return PlayerState.MoveUp;
    }
    if (keyboard.isPressed('ArrowDown')) {
      return PlayerState.MoveDown;
    }

    return onStairs ? PlayerState.OnStairs : PlayerState.Stand;
  }

  private isGroundedBelow(): boolean {
    const { x, y } = this.gameObject.position;
    return this.tileMap.isSolidAtPixel(x, y + CELL_SIZE);
  }

  private isOnStairs(): boolean {
    const { x, y } = this.gameObject.position;
    return this.tileMap.getTileAtPixel(x, y) === TileType.Stairs;
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
      case PlayerState.MoveUp:
        targetY = y - CELL_SIZE;
        break;
      case PlayerState.MoveDown:
      case PlayerState.Fall:
        targetY = y + CELL_SIZE;
        break;
      case PlayerState.Stand:
      case PlayerState.OnStairs:
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

  private clearPreviousPosition(previousPosition: { x: number; y: number }): void {
    const { x, y } = this.gameObject.position;
    if (Math.floor(previousPosition.x) === Math.floor(x) && Math.floor(previousPosition.y) === Math.floor(y)) {
      return;
    }

    if (this.tileMap.isSolidAtPixel(previousPosition.x, previousPosition.y)) {
      return;
    }

    this.gameObject.engineState.screenBuffer.copy(OBJECT_EMPTY, previousPosition.x, previousPosition.y, FOREGROUND_LAYER);
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
}
