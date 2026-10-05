import { TileElement, TileWithOptions } from '../../scripts/tile-map/tile-map-types';
import { ___, Brh, Brk, BSG, Crb, EbL, EbR, EmD, EmL, EmU, EnS, GGT, Gld, Lav, PlF, PlS, Str } from './level-map-constants';
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
  [___, PlF, ___, SGT, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, EmL, Brk],
  [Brh, Brh, Brh, Brh, Brh, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___],
  [___, ___, ___, ___, ___, ___, ___, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___],
  [___, ___, ___, ___, ___, ___, ___, Gld, ___, Brk, ___, EmD, ___, ___, ___, ___, Brk, ___, Gld, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___],
  [___, ___, ___, ___, ___, ___, ___, Brk, Brk, ___, ___, ___, ___, ___, ___, ___, ___, Brk, Brk, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___],
  [___, ___, ___, ___, ___, ___, ___, ___, Brk, ___, ___, ___, ___, ___, ___, ___, EbL, Brk, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___],
  [___, ___, ___, ___, ___, ___, ___, ___, Brk, Brk, ___, ___, ___, ___, ___, ___, ___, Brk, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___],
  [___, ___, ___, ___, ___, ___, ___, ___, Brk, ___, ___, ___, ___, ___, ___, ___, ___, Brk, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___],
  [___, ___, ___, ___, ___, ___, ___, ___, Brk, ___, ___, ___, ___, ___, ___, ___, Brk, Brk, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___],
  [___, ___, ___, ___, ___, ___, ___, ___, Brk, EbR, ___, ___, ___, ___, ___, ___, ___, Brk, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___],
  [___, ___, ___, ___, ___, ___, ___, ___, Brk, ___, ___, ___, ___, ___, ___, ___, ___, Brk, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___],
  [___, ___, ___, ___, ___, ___, ___, Gld, ___, Brk, ___, ___, ___, ___, EmU, ___, Brk, ___, Gld, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___],
  [___, ___, ___, ___, ___, ___, ___, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___],
  [___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, PlS, ___, ___, ___, ___, ___, ___, ___, ___, ___, SSG, ___, ___, ___, ___],
  [___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, Brk, Lav, Brk, Lav, Brk, Lav, Brk, ___],
  [___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, Brh, ___, ___, ___, ___, ___, ___, Brk, Brk, Brk, Brk, Brk, Brk, Brk, ___],
  [___, ___, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, Brk, Brk, Brk, EnS, Brk, Brk, Brk, ___],
  [___, ___, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, Brk, Brk, ___, Brk, Brk, ___, ___],
  [___, ___, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, Brk, Brk, ___, Brk, Brk, ___, ___],
  [___, ___, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, ___, ___, Brk, Brk, ___, Brk, Brk, ___, ___],
  [___, ___, ___, ___, ___, ___, ___, ___, ___, Str, ___, Brh, ___, ___, ___, ___, ___, ___, ___, ___, Str, ___, ___, Crb, Crb, SGT, ___, ___, ___, SGT, Crb, Crb],
  [Brk, Brk, Lav, Lav, Lav, Brk, Brk, Brk, Brk, Brk, Brk, Brh, Brh, Brh, Brh, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Brk, Lav, Lav, Brk, Brk, Brk, Brk, Brk, Lav, Lav],
];

export class XLodeRunnerLevel2 extends XLodeRunnerLevel {
  public static create(engineState: IEngineState): XLodeRunnerLevel2 {
    return new XLodeRunnerLevel2(engineState);
  }

  protected constructor(engineState: IEngineState) {
    super(engineState);
  }

  public map: TileElement[][] = map;

  public async initialize(): Promise<GameObject[]> {
    return this.setup();
  }
}
