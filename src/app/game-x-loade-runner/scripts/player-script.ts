import { Script } from '../../engine/game-object/script';
import { GameObject } from '../../engine/game-object/game-object';
import { DEATH_JINGLE } from '../../engine/audio/music-player';
import { DelayedAction } from '../../engine/delayed-action';
import { LivesScript } from './lives-script';
import { StateScript } from './state-script';

const DYING_DURATION_SECONDS = 1;
const BORNING_DURATION_SECONDS = 1.1;

export class PlayerScript extends Script {
  public static create(gameObject: GameObject): PlayerScript {
    return new PlayerScript(gameObject);
  }

  private _stateScript: StateScript | null = null;
  private dying: DelayedAction | null = null;
  private borning: DelayedAction = DelayedAction.create(BORNING_DURATION_SECONDS, () => this.stateScript.startLife());

  private constructor(gameObject: GameObject) {
    super(gameObject);
  }

  private get lives(): LivesScript {
    return this.gameObject.engineState.getGameObjectByName('Lives')!.getScript(LivesScript)!;
  }

  private get stateScript(): StateScript {
    return this._stateScript ?? (this._stateScript = this.gameObject.getScript(StateScript)!);
  }

  public override update(): void {
    if (this.borning.isPending) {
      this.borning.advance(this.gameObject.engineState.deltaTime);
      return;
    }

    if (this.dying != null) {
      this.dying.advance(this.gameObject.engineState.deltaTime);
      return;
    }

    if (this.stateScript.isDying()) {
      this.beginDying();
    }
  }

  private beginDying(): void {
    this.dying = DelayedAction.create(DYING_DURATION_SECONDS, () => this.lives.loseLife());
    const { musicPlayer } = this.gameObject.engineState;
    musicPlayer.register('Death', DEATH_JINGLE);
    musicPlayer.play('Death');
  }
}
