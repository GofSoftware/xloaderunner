import { Script } from '../../engine/game-object/script';
import { GameObject } from '../../engine/game-object/game-object';
import { BitmapSpriteRenderer } from '../../engine/scripts/bitmap-sprite-renderer';
import { TileMap } from './tile-map/tile-map';
import { BACKGROUND_LAYER, CELL_SIZE, FOREGROUND_LAYER } from '../../engine/screen/screen.constants';
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
  STAND_ANIMATION_LOOK_LEFT,
  STAND_ANIMATION_LOOK_RIGHT,
} from '../../engine/scripts/animations';
import { BitmapRenderer } from '../../engine/scripts/bitmap-renderer';
import { OBJECT_EXCLAMATION } from '../data/sprites';
import { DestroyAfterTime } from '../../engine/scripts/destroy-after-time';
import { TextRenderer } from '../../engine/scripts/text-renderer';
import { DEATH_JINGLE } from '../../engine/audio/music-player';
import { LivesScript } from './lives-script';
import { ObjectPosition } from './object-position';
import { TileType } from './tile-map/tile-map-types';
import { Direction, PlayerState } from './state/state-types';

const MOVE_SPEED = 40;
const FALL_SPEED = 60;
const LEDGE_HESITATION_SECONDS = 0.3;
// Kept tiny on purpose: long enough to swallow a direction key tap as a pure look-around,
// short enough that holding the key to actually run never reads as a pause.
const TURN_DELAY_SECONDS = 0.08;
const DYING_DURATION_SECONDS = 1;
const ANIMATION_BY_STATE: Record<PlayerState, { frames: number[][][]; framesPerSecond: number }> = {
  [PlayerState.Stand]: STAND_ANIMATION,
  [PlayerState.TurnLeft]: STAND_ANIMATION_LOOK_LEFT,
  [PlayerState.TurnRight]: STAND_ANIMATION_LOOK_RIGHT,
  // Reuses STAND_ANIMATION as a placeholder - no dedicated look-up/look-down art yet.
  [PlayerState.TurnUp]: STAND_ANIMATION,
  [PlayerState.TurnDown]: STAND_ANIMATION,
  [PlayerState.MoveLeft]: MOVE_ANIMATION_LEFT,
  [PlayerState.MoveRight]: MOVE_ANIMATION_RIGHT,
  [PlayerState.MoveUp]: CLIMB_ANIMATION,
  [PlayerState.MoveDown]: CLIMB_ANIMATION,
  [PlayerState.Fall]: FALL_ANIMATION,
  // Trapped reuses the falling animation - visually indistinguishable from Fall, but pinned in place
  // (see stepSpeed below and the getsTrappedInHoles check in resolveState).
  [PlayerState.Trapped]: FALL_ANIMATION,
  [PlayerState.OnStairs]: ON_STAIRS_ANIMATION,
  [PlayerState.OnCrossbar]: ON_CROSSBAR_ANIMATION,
  [PlayerState.OnCrossbarMoveLeft]: ON_CROSSBAR_MOVE_LEFT_ANIMATION,
  [PlayerState.OnCrossbarMoveRight]: ON_CROSSBAR_MOVE_RIGHT_ANIMATION,
  // Reuses STAND_ANIMATION as a placeholder - no dedicated death/game-over art yet.
  [PlayerState.Dying]: STAND_ANIMATION,
  [PlayerState.GameOver]: STAND_ANIMATION,
};
const TURN_STATE_BY_DIRECTION: Record<Direction, PlayerState> = {
  [Direction.Left]: PlayerState.TurnLeft,
  [Direction.Right]: PlayerState.TurnRight,
  [Direction.Up]: PlayerState.TurnUp,
  [Direction.Down]: PlayerState.TurnDown,
};

export class StateScript extends Script {
  public static create(
    gameObject: GameObject,
    spawnCell: { column: number; row: number },
    runSpeedMultiplier: number = 1,
    getsTrappedInHoles: boolean = false,
  ): StateScript {
    return new StateScript(gameObject, spawnCell, runSpeedMultiplier, getsTrappedInHoles);
  }

  private readonly stepSpeed: Record<PlayerState, number>;
  private readonly spawnCell: { column: number; row: number };
  // Whether landing on a blasted-open brick pins this character in place (Trapped) instead of
  // falling straight through it - used to trap Enemy in a dug hole, but not the Player.
  private readonly getsTrappedInHoles: boolean;
  private state: PlayerState | undefined;
  private movingState: PlayerState | undefined;
  private hesitation: { state: PlayerState.MoveLeft | PlayerState.MoveRight; elapsed: number; warned: boolean } | undefined;
  private dying: { elapsed: number } | undefined;

  // currentDirection is the way the sprite is looking, updated by updateFacingDirection() from
  // whichever arrow key is held - regardless of whether a step that way is actually possible.
  // lastMoveDirection is the direction last actually committed to (undefined until the player's
  // first move) and is what turnPause gates against - so reversing an established movement direction
  // always pauses briefly before the first step, but the player's very first move, holding the same
  // direction, or re-affirming it after the pause, never does.
  private currentDirection: Direction = Direction.Right;
  private lastMoveDirection: Direction | undefined;
  private turnPause: { direction: Direction; elapsed: number } | undefined;

  private isForcedLeft = false;
  private isForcedRight = false;
  private isForcedUp = false;
  private isForcedDown = false;

  private constructor(
    gameObject: GameObject,
    spawnCell: { column: number; row: number },
    runSpeedMultiplier: number,
    getsTrappedInHoles: boolean,
  ) {
    super(gameObject);
    this.spawnCell = spawnCell;
    this.getsTrappedInHoles = getsTrappedInHoles;
    this.stepSpeed = {
      [PlayerState.Stand]: 0,
      [PlayerState.TurnLeft]: 0,
      [PlayerState.TurnRight]: 0,
      [PlayerState.TurnUp]: 0,
      [PlayerState.TurnDown]: 0,
      [PlayerState.MoveLeft]: MOVE_SPEED * runSpeedMultiplier,
      [PlayerState.MoveRight]: MOVE_SPEED * runSpeedMultiplier,
      [PlayerState.MoveUp]: MOVE_SPEED * runSpeedMultiplier,
      [PlayerState.MoveDown]: MOVE_SPEED * runSpeedMultiplier,
      // Falling is gravity, not running - it stays the same for every StateScript regardless of runSpeedMultiplier.
      [PlayerState.Fall]: FALL_SPEED,
      // Pinned in place - see the getsTrappedInHoles comment above.
      [PlayerState.Trapped]: 0,
      [PlayerState.OnStairs]: 0,
      [PlayerState.OnCrossbar]: 0,
      [PlayerState.OnCrossbarMoveLeft]: MOVE_SPEED * runSpeedMultiplier,
      [PlayerState.OnCrossbarMoveRight]: MOVE_SPEED * runSpeedMultiplier,
      [PlayerState.Dying]: 0,
      [PlayerState.GameOver]: 0,
    };
  }

  private get objectPosition(): ObjectPosition {
    return this.gameObject.getScript(ObjectPosition)!;
  }

  private get tileMap(): TileMap {
    return this.gameObject.engineState.getGameObjectByName('Map')!.getScript(TileMap)!;
  }

  private get lives(): LivesScript {
    return this.gameObject.engineState.getGameObjectByName('Lives')!.getScript(LivesScript)!;
  }

  public get direction(): Direction {
    return this.currentDirection;
  }

  public forceLeft(value: boolean): void {
    this.isForcedLeft = value;
  }

  public forceRight(value: boolean): void {
    this.isForcedRight = value;
  }

  public forceUp(value: boolean): void {
    this.isForcedUp = value;
  }

  public forceDown(value: boolean): void {
    this.isForcedDown = value;
  }

  public override update(): void {
    if (this.state === PlayerState.GameOver) {
      this.resetForces();
      return;
    }

    let activeState: PlayerState;
    if (this.objectPosition.isMoving) {
      activeState = this.movingState!;
    } else {
      activeState = this.resolveState();
      if (this.stepSpeed[activeState] > 0) {
        this.movingState = activeState;
        const { column, row } = this.computeStepTarget(activeState);
        this.objectPosition.moveTo(column, row, this.stepSpeed[activeState]);
      }
    }

    this.setState(activeState);
  }

  private resetForces(): void {
    this.isForcedLeft = false;
    this.isForcedRight = false;
    this.isForcedUp = false;
    this.isForcedDown = false;
  }

  private resolveState(): PlayerState {
    this.updateFacingDirection();
    const { column, row } = this.objectPosition;

    if (this.dying) {
      return this.advanceDying();
    }
    if (this.tileMap.isDangerous(column, row)) {
      return this.beginDying();
    }
    if (this.getsTrappedInHoles && this.tileMap.getTile(column, row) === TileType.BlastedBrick) {
      this.hesitation = undefined;
      return PlayerState.Trapped;
    }

    const onStairs = this.isOnStairs();
    const onCrossbar = this.isOnCrossbar();

    if (!onStairs && !onCrossbar && !this.isGroundedBelow()) {
      this.hesitation = undefined;
      return PlayerState.Fall;
    }

    if (!onCrossbar) {
      const groundMove = this.resolveGroundMove();
      if (groundMove) {
        return groundMove;
      }
    } else {
      this.hesitation = undefined;
      if (this.isForcedLeft && !this.tileMap.isWall(column - 1, row)) {
        return this.beginDirectionalMove(Direction.Left, () => PlayerState.OnCrossbarMoveLeft);
      }
      if (this.isForcedRight && !this.tileMap.isWall(column + 1, row)) {
        return this.beginDirectionalMove(Direction.Right, () => PlayerState.OnCrossbarMoveRight);
      }
    }

    if (onStairs && this.isForcedUp && !this.tileMap.isWall(column, row - 1)) {
      return this.beginDirectionalMove(Direction.Up, () => PlayerState.MoveUp);
    }
    if (this.isForcedDown && !this.tileMap.isWall(column, row + 1)) {
      return this.beginDirectionalMove(Direction.Down, () => PlayerState.MoveDown);
    }

    if (onStairs) {
      return PlayerState.OnStairs;
    }
    if (onCrossbar) {
      return PlayerState.OnCrossbar;
    }
    return PlayerState.Stand;
  }

  // Faces the sprite toward whichever direction is currently pressed, regardless of whether a step
  // that way is actually possible right now (a wall in the way, not being on stairs, etc.) - pressing
  // a direction key always turns the player to look that way. Left/Right/Up/Down is the priority order
  // when more than one is held at once.
  private updateFacingDirection(): void {
    if (this.isForcedLeft) {
      this.currentDirection = Direction.Left;
    } else if (this.isForcedRight) {
      this.currentDirection = Direction.Right;
    } else if (this.isForcedUp) {
      this.currentDirection = Direction.Up;
    } else if (this.isForcedDown) {
      this.currentDirection = Direction.Down;
    }
  }

  private isForced(state: PlayerState.MoveLeft | PlayerState.MoveRight): boolean {
    return state === PlayerState.MoveLeft ? this.isForcedLeft : this.isForcedRight;
  }

  private resolveGroundMove(): PlayerState | undefined {
    if (!this.hesitation || this.hesitation.warned) {
      const attempt = this.beginGroundMove();
      if (attempt !== PlayerState.Stand || !this.hesitation || this.hesitation.warned) {
        return attempt;
      }
    }

    this.hesitation!.elapsed += this.gameObject.engineState.deltaTime;
    if (this.hesitation!.elapsed < LEDGE_HESITATION_SECONDS) {
      return PlayerState.Stand;
    }
    const { state } = this.hesitation!;
    // Keep remembering this direction as a single-use skip for the next attempt,
    // instead of clearing it outright - see startGroundMove.
    this.hesitation = { state, elapsed: 0, warned: true };
    return this.isForced(state) ? state : PlayerState.Stand;
  }

  private beginGroundMove(): PlayerState | undefined {
    const { column, row } = this.objectPosition;

    if (this.isForcedLeft && !this.tileMap.isWall(column - 1, row)) {
      return this.beginDirectionalMove(Direction.Left, () => this.startGroundMove(PlayerState.MoveLeft, column - 1, row));
    }
    if (this.isForcedRight && !this.tileMap.isWall(column + 1, row)) {
      return this.beginDirectionalMove(Direction.Right, () => this.startGroundMove(PlayerState.MoveRight, column + 1, row));
    }

    return undefined;
  }

  // updateFacingDirection() has already turned the sprite toward `direction` by the time this runs -
  // this only decides whether a step is actually allowed to start yet, pausing briefly the first time
  // it reverses an already-established movement direction. See the field comments on
  // currentDirection/lastMoveDirection/turnPause for why the two directions are tracked separately.
  private beginDirectionalMove(direction: Direction, onReady: () => PlayerState): PlayerState {
    if (this.lastMoveDirection === undefined || this.lastMoveDirection === direction) {
      this.lastMoveDirection = direction;
      this.turnPause = undefined;
      return onReady();
    }

    if (!this.turnPause || this.turnPause.direction !== direction) {
      this.turnPause = { direction, elapsed: 0 };
    }
    this.turnPause.elapsed += this.gameObject.engineState.deltaTime;
    if (this.turnPause.elapsed < TURN_DELAY_SECONDS) {
      return TURN_STATE_BY_DIRECTION[direction];
    }

    this.turnPause = undefined;
    this.lastMoveDirection = direction;
    return onReady();
  }

  private startGroundMove(state: PlayerState.MoveLeft | PlayerState.MoveRight, targetColumn: number, targetRow: number): PlayerState {
    if (!this.tileMap.isDangerous(targetColumn, targetRow + 1) || this.tileMap.isClimbable(targetColumn, targetRow)) {
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

    this.hesitation = { state, elapsed: 0, warned: false };
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
    this.objectPosition.teleportTo(this.spawnCell.column, this.spawnCell.row);
    this.currentDirection = Direction.Right;
    this.lastMoveDirection = undefined;
    this.turnPause = undefined;
    return PlayerState.Stand;
  }

  private showGameOver(): void {
    const gameOverText = GameObject.create('GameOverText', this.gameObject.engineState, { x: 96, y: 88 }, [
      (gameObject: GameObject) => TextRenderer.create(gameObject, 'GAME OVER', FOREGROUND_LAYER),
    ]);
    this.gameObject.engineState.addGameObject(gameOverText);
  }

  private isGroundedBelow(): boolean {
    const { column, row } = this.objectPosition;
    if (this.tileMap.isSolid(column, row + 1)) {
      return true;
    }
    // A blasted-open brick isn't solid on its own, but once something is occupying it (an Enemy
    // trapped there - see getsTrappedInHoles) it forms a floor/bridge over the hole, so this
    // character stands on top of it instead of falling in too.
    return this.tileMap.getTile(column, row + 1) === TileType.BlastedBrick && this.tileMap.getObjectsAt(column, row + 1).length > 0;
  }

  private isOnStairs(): boolean {
    const { column, row } = this.objectPosition;
    return this.tileMap.getTile(column, row) === TileType.Stairs;
  }

  private isOnCrossbar(): boolean {
    const { column, row } = this.objectPosition;
    return this.tileMap.getTile(column, row) === TileType.Crossbar;
  }

  private computeStepTarget(state: PlayerState): { column: number; row: number } {
    const { column, row } = this.objectPosition;
    let targetColumn = column;
    let targetRow = row;

    switch (state) {
      case PlayerState.MoveLeft:
      case PlayerState.OnCrossbarMoveLeft:
        targetColumn = column - 1;
        break;
      case PlayerState.MoveRight:
      case PlayerState.OnCrossbarMoveRight:
        targetColumn = column + 1;
        break;
      case PlayerState.MoveUp:
        targetRow = row - 1;
        break;
      case PlayerState.MoveDown:
      case PlayerState.Fall:
        targetRow = row + 1;
        break;
      case PlayerState.Stand:
      case PlayerState.TurnLeft:
      case PlayerState.TurnRight:
      case PlayerState.TurnUp:
      case PlayerState.TurnDown:
      case PlayerState.Trapped:
      case PlayerState.OnStairs:
      case PlayerState.OnCrossbar:
      case PlayerState.Dying:
      case PlayerState.GameOver:
        break;
    }

    return {
      column: StateScript.clamp(targetColumn, 0, this.tileMap.columns - 1),
      row: StateScript.clamp(targetRow, 0, this.tileMap.rows - 1),
    };
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

    let animation = ANIMATION_BY_STATE[this.state];
    if (this.state === PlayerState.Stand && this.currentDirection === Direction.Left) {
      animation = STAND_ANIMATION_LOOK_LEFT;
    }
    if (this.state === PlayerState.Stand && this.currentDirection === Direction.Right) {
      animation = STAND_ANIMATION_LOOK_RIGHT;
    }
    spriteRenderer.setAnimation({ bitmap: animation.frames, framePerSecond: animation.framesPerSecond });
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
