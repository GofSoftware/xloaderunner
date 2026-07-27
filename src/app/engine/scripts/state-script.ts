import { Script } from '../game-object/script';
import { GameObject } from '../game-object/game-object';
import { BitmapSpriteRenderer } from './bitmap-sprite-renderer';
import { TileMap } from './tile-map';
import { CELL_SIZE, SCREEN_HEIGHT, SCREEN_WIDTH } from '../screen/screen.constants';
import { MAN_STANDING_FRAME_1, MAN_STANDING_FRAME_2, MAN_STANDING_FRAME_3, MAN_STANDING_FRAME_4 } from '../../data/sprites';

export enum PlayerState {
  Stand = 'Stand',
  MoveLeft = 'MoveLeft',
  MoveRight = 'MoveRight',
  MoveUp = 'MoveUp',
  MoveDown = 'MoveDown',
  Fall = 'Fall',
}

const MOVE_SPEED = 40;
const FALL_SPEED = 60;

const STAND_ANIMATION = { frames: [MAN_STANDING_FRAME_2, MAN_STANDING_FRAME_4], framesPerSecond: 2 };
const MOVE_ANIMATION = { frames: [MAN_STANDING_FRAME_1, MAN_STANDING_FRAME_3], framesPerSecond: 6 };
const FALL_ANIMATION = { frames: [MAN_STANDING_FRAME_1], framesPerSecond: 0 };

const ANIMATION_BY_STATE: Record<PlayerState, { frames: number[][][]; framesPerSecond: number }> = {
  [PlayerState.Stand]: STAND_ANIMATION,
  [PlayerState.MoveLeft]: MOVE_ANIMATION,
  [PlayerState.MoveRight]: MOVE_ANIMATION,
  [PlayerState.MoveUp]: MOVE_ANIMATION,
  [PlayerState.MoveDown]: MOVE_ANIMATION,
  [PlayerState.Fall]: FALL_ANIMATION,
};

export class StateScript extends Script {
  public static create(gameObject: GameObject, tileMap: TileMap): StateScript {
    return new StateScript(gameObject, tileMap);
  }

  private readonly gameObject: GameObject;
  private readonly tileMap: TileMap;
  private state: PlayerState = PlayerState.Stand;

  private constructor(gameObject: GameObject, tileMap: TileMap) {
    super();
    this.gameObject = gameObject;
    this.tileMap = tileMap;
  }

  public override update(): void {
    const nextState = this.resolveState();
    this.applyMovement(nextState);
    this.setState(nextState);
  }

  private resolveState(): PlayerState {
    if (!this.isGroundedBelow()) {
      return PlayerState.Fall;
    }

    const { keyboard } = this.gameObject.engineState;
    if (keyboard.isPressed('ArrowLeft')) {
      return PlayerState.MoveLeft;
    }
    if (keyboard.isPressed('ArrowRight')) {
      return PlayerState.MoveRight;
    }
    if (keyboard.isPressed('ArrowUp')) {
      return PlayerState.MoveUp;
    }
    if (keyboard.isPressed('ArrowDown')) {
      return PlayerState.MoveDown;
    }

    return PlayerState.Stand;
  }

  private isGroundedBelow(): boolean {
    const { x, y } = this.gameObject.position;
    return this.tileMap.isSolidAtPixel(x, y + CELL_SIZE);
  }

  private applyMovement(state: PlayerState): void {
    const { deltaTime } = this.gameObject.engineState;
    const { x, y } = this.gameObject.position;
    const distance = MOVE_SPEED * deltaTime;

    let nextX = x;
    let nextY = y;

    switch (state) {
      case PlayerState.MoveLeft:
        nextX = x - distance;
        break;
      case PlayerState.MoveRight:
        nextX = x + distance;
        break;
      case PlayerState.MoveUp:
        nextY = y - distance;
        break;
      case PlayerState.MoveDown:
        nextY = y + distance;
        break;
      case PlayerState.Fall:
        nextY = y + FALL_SPEED * deltaTime;
        break;
      case PlayerState.Stand:
        break;
    }

    this.gameObject.setPosition(
      StateScript.clamp(nextX, 0, SCREEN_WIDTH - CELL_SIZE),
      StateScript.clamp(nextY, 0, SCREEN_HEIGHT - CELL_SIZE),
    );
  }

  private static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private setState(state: PlayerState): void {
    this.state = state;

    const spriteRenderer = this.gameObject.getScript(BitmapSpriteRenderer);
    if (!spriteRenderer) {
      return;
    }

    const animation = ANIMATION_BY_STATE[this.state];
    spriteRenderer.setAnimation(animation.frames, animation.framesPerSecond);
  }
}
