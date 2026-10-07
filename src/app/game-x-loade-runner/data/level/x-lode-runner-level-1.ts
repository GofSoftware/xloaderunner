import { TileElement, TileWithOptions } from '../../scripts/tile-map/tile-map-types';
import { ___, Brh, Brk, BSG, Crb, EbL, EbR, EmD, EmL, EmU, EnS, GGT, Gld, Lav, PlF, PlS, Str, MRR, EmR } from './level-map-constants';
import { IEngineState } from '../../../engine/i-engine-state';
import { XLodeRunnerLevel } from './x-lode-runner-level';
import { GameObject } from '../../../engine/game-object/game-object';
import { IGoldenGateLockOptions } from '../../scripts/golden-gate/i-golden-gate-lock-options';
import { IBeamSwitchOptions } from '../../scripts/beam-switch/i-beam-switch-options';

const BEAM_SWITCH_1_NAME = 'BEAM_SWITCH_1_NAME'

const SGT: TileWithOptions<IGoldenGateLockOptions> = {
  type: GGT,
  options: {
    linkedOnOffScriptName: BEAM_SWITCH_1_NAME
  },
}

const SSG: TileWithOptions<IBeamSwitchOptions> = { type: BSG, options: {onOffName: BEAM_SWITCH_1_NAME} }

// prettier-ignore
const map: TileElement[][] = [
  [___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___],
  [___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___],
  [___, PlF, ___, SGT, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, EnS, ___],
  [Brh, Brh, Brh, Brh, Brh, Str, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___],
  [___, ___, ___, ___, ___, Str, ___, ___, ___, ___, Gld, ___, ___, ___, ___, ___, ___, ___, ___, ___, Gld, ___, ___, ___, ___, ___, ___, ___, Crb, Crb, Crb, ___],
  [___, EnS, ___, ___, ___, Str, ___, ___, ___, ___, Brk, Brk, Brk, Brk, Brk, Brk, Brh, Brh, Brh, Brh, Brh, Brk, Brk, Brk, Brk, Brk, Brk, Brk, ___, ___, Gld, Str],
  [___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, Str],
  [___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, Str],
  [___, ___, Gld, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, Gld, ___, ___, ___, ___, ___, ___, ___, Gld, ___, ___, ___, Str],
  [Brk, Brk, Brk, Brk, Brk, Str, Crb, Crb, Crb, Crb, Crb, Crb, Crb, Str, Crb, Crb, Crb, Crb, Crb, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Str, Brk, Brk, Brk, Brk, Brk],
  [___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___],
  [___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___],
  [___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___],
  [PlS, ___, ___, ___, Crb, Crb, Crb, Crb, Crb, Str, ___, Gld, ___, Str, ___, ___, ___, ___, ___, ___, ___, Gld, ___, ___, ___, ___, Str, ___, ___, ___, Gld, ___],
  [Brh, EmR, ___, ___, ___, ___, ___, ___, Brh, Str, Brh, Brh, Brh, Brh, Brh, Brh, Brh, Brh, Str, Brk, Brk, Brk, Brk, Brk, Brh, Brh, Brh, Brh, Brh, Brk, Brk, Str],
  [___, ___, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, Str],
  [___, ___, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, Str],
  [___, ___, ___, ___, SSG, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, Gld, ___, ___, Brh, ___, ___, Str],
  [Str, Brk, Brk, Brk, Brk, Brk, Str, Brk, Brk, Str, ___, ___, ___, ___, Str, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Str, ___, ___, Brh, Brh, Brh, Brh, ___, ___, Str],
  [Str, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, Brh, Brh, ___, ___, EnS, Str],
  [Str, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, Brh, Brh, ___, ___, ___, Str],
  [Str, Crb, Crb, Crb, Crb, Crb, Str, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, Brh, Brh, ___, ___, ___, Str],
  [Str, ___, ___, ___, ___, Gld, Str, ___, ___, Gld, ___, ___, ___, ___, Str, ___, ___, ___, Gld, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, Gld, ___, Str],
  [Brk, Brk, Lav, Lav, Lav, Brk, Brk, Brk, Brk, Brk, Brk, Brh, Brh, Brh, Brh, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk],
];

export class XLodeRunnerLevel1 extends XLodeRunnerLevel {
  public static create(engineState: IEngineState): XLodeRunnerLevel1 {
    return new XLodeRunnerLevel1(engineState);
  }

  protected constructor(engineState: IEngineState) {
    super(engineState);
  }

  public map: TileElement[][] = map;

  public async initialize(): Promise<GameObject[]> {
    return this.setup();
  }
}
