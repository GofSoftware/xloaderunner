import { Script } from '../game-object/script';
import { GameObject } from '../game-object/game-object';
import { BitmapSpriteRenderer } from './bitmap-sprite-renderer';
import { TileMap, TileType } from './tile-map';
import { BACKGROUND_LAYER, CELL_SIZE, FOREGROUND_LAYER } from '../screen/screen.constants';
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
import { LivesScript } from './lives-script';
import { ObjectPosition } from './object-position';

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
  public static create(gameObject: GameObject, spawnCell: { column: number; row: number }): StateScript {
    return new StateScript(gameObject, spawnCell);
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

  private readonly spawnCell: { column: number; row: number };
  private state: PlayerState | undefined;
  private movingState: PlayerState | undefined;
  private hesitation: { state: PlayerState.MoveLeft | PlayerState.MoveRight; elapsed: number; warned: boolean } | undefined;
  private dying: { elapsed: number } | undefined;

  private isForcedLeft = false;
  private isForcedRight = false;
  private isForcedUp = false;
  private isForcedDown = false;

  private constructor(gameObject: GameObject, spawnCell: { column: number; row: number }) {
    super(gameObject);
    this.spawnCell = spawnCell;
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
      if (StateScript.STEP_SPEED[activeState] > 0) {
        this.movingState = activeState;
        const { column, row } = this.computeStepTarget(activeState);
        this.objectPosition.moveTo(column, row, StateScript.STEP_SPEED[activeState]);
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
    const { column, row } = this.objectPosition;

    if (this.dying) {
      return this.advanceDying();
    }
    if (this.tileMap.isDangerous(column, row)) {
      return this.beginDying();
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
        return PlayerState.OnCrossbarMoveLeft;
      }
      if (this.isForcedRight && !this.tileMap.isWall(column + 1, row)) {
        return PlayerState.OnCrossbarMoveRight;
      }
    }

    if (onStairs && this.isForcedUp && !this.tileMap.isWall(column, row - 1)) {
      return PlayerState.MoveUp;
    }
    if (this.isForcedDown && !this.tileMap.isWall(column, row + 1)) {
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
      return this.startGroundMove(PlayerState.MoveLeft, column - 1, row);
    }
    if (this.isForcedRight && !this.tileMap.isWall(column + 1, row)) {
      return this.startGroundMove(PlayerState.MoveRight, column + 1, row);
    }

    return undefined;
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
    return this.tileMap.isSolid(column, row + 1);
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
