import { Script } from '../../engine/game-object/script';
import { GameObject } from '../../engine/game-object/game-object';
import { DEATH_JINGLE } from '../../engine/audio/music-player';
import { LivesScript } from './lives-script';
import { StateScript } from './state-script';

const DYING_DURATION_SECONDS = 1;

export class PlayerScript extends Script {
  public static create(gameObject: GameObject): PlayerScript {
    return new PlayerScript(gameObject);
  }

  private _stateScript: StateScript | null = null;
  private dying: { elapsed: number } | null = null;

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
    if (this.dying != null) {
      this.advanceDying();
      return;
    }

    if (this.stateScript.isDying()) {
      this.beginDying();
    }
  }

  private beginDying(): void {
    this.dying = { elapsed: 0 };
    const { musicPlayer } = this.gameObject.engineState;
    musicPlayer.register('Death', DEATH_JINGLE);
    musicPlayer.play('Death');
  }

  private advanceDying(): void {
    this.dying!.elapsed += this.gameObject.engineState.deltaTime;
    if (this.dying!.elapsed < DYING_DURATION_SECONDS) {
      return;
    }
    this.dying = null;
    this.lives.loseLife();
  }
}
