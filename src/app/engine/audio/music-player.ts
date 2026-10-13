import { IMusicNote } from './i-music-note';
import { SoundPlayer } from './sound-player';

const C3 = 130.81;
const D3 = 146.83;
const E3 = 164.81;
const F3 = 174.61;
const G3 = 196.0;
const A3 = 220.0;
const B3 = 246.94;

const C4 = 261.63;
const D4 = 293.66;
const E4 = 329.63;
const F4 = 349.23;
const G4 = 392.0;
const A4 = 440.0;
const B4 = 493.88;

const C5 = 523.25;
const D5 = 587.33;
const E5 = 659.25;
const F5 = 698.46;
const G5 = 783.99;
const A5 = 880.0;
const B5 = 987.77;

const C6 = 1046.5;


export const BG_JINGLE: IMusicNote[] = [
  { frequency: C4, duration: 0.05 },
  { frequency: 0, duration: 1 },
  { frequency: C4, duration: 0.05 },
  { frequency: 0, duration: 1 },
  { frequency: C4, duration: 0.05 },
  { frequency: 0, duration: 0.5 },
  { frequency: D4, duration: 0.05 },
  { frequency: 0, duration: 0.5 },
  { frequency: C4, duration: 0.05 },
  { frequency: 0, duration: 1 },
];

export const BORN_JINGLE: IMusicNote[] = [
  { frequency: C4, duration: 0.05 },
  { frequency: E4, duration: 0.05 },
  { frequency: G4, duration: 0.05 },
];

export const DEATH_JINGLE: IMusicNote[] = [
  { frequency: G4, duration: 0.15 },
  { frequency: F4, duration: 0.15 },
  { frequency: D4, duration: 0.15 },
  { frequency: C4, duration: 0.4 },
];

export const FINISH_JINGLE: IMusicNote[] = [
  { frequency: C4, duration: 0.15 },
  { frequency: E4, duration: 0.15 },
  { frequency: G4, duration: 0.15 },
  { frequency: A4, duration: 0.3 },
  { frequency: G4, duration: 0.15 },
  { frequency: A4, duration: 0.3 },
];

export const DEATH_ENEMY_JINGLE: IMusicNote[] = [{ frequency: 50, duration: 0.3 }];

export const TWINKLE_TWINKLE_LITTLE_STAR: IMusicNote[] = [
  { frequency: C4, duration: 0.4 },
  { frequency: C4, duration: 0.4 },
  { frequency: G4, duration: 0.4 },
  { frequency: G4, duration: 0.4 },
  { frequency: A4, duration: 0.4 },
  { frequency: A4, duration: 0.4 },
  { frequency: G4, duration: 0.8 },
  { frequency: 0, duration: 0.2 },
  { frequency: F4, duration: 0.4 },
  { frequency: F4, duration: 0.4 },
  { frequency: E4, duration: 0.4 },
  { frequency: E4, duration: 0.4 },
  { frequency: D4, duration: 0.4 },
  { frequency: D4, duration: 0.4 },
  { frequency: C4, duration: 0.8 },
];

interface IPlaybackState {
  index: number;
  timeoutId: ReturnType<typeof setTimeout> | undefined;
  infinite: boolean;
}

export class MusicPlayer {
  public static create(soundPlayer: SoundPlayer): MusicPlayer {
    return new MusicPlayer(soundPlayer);
  }

  private readonly sequences = new Map<string, IMusicNote[]>();
  private readonly playbackStates = new Map<string, IPlaybackState>();

  private constructor(private readonly soundPlayer: SoundPlayer) {}

  public register(name: string, notes: IMusicNote[]): void {
    this.sequences.set(name, notes);
  }

  public play(name: string, from: number = 0, infinite: boolean = false): void {
    this.clearScheduled(name);
    this.playbackStates.set(name, { index: from, timeoutId: undefined, infinite });
    this.advance(name);
  }

  public stop(name: string): void {
    this.clearScheduled(name);
    this.playbackStates.delete(name);
  }

  public pause(name: string): void {
    this.clearScheduled(name);
  }

  public continue(name: string): void {
    const state = this.playbackStates.get(name);
    if (!state || state.timeoutId !== undefined) {
      return;
    }
    this.advance(name);
  }

  private async advance(name: string): Promise<void> {
    const state = this.playbackStates.get(name);
    if (!state) {
      return;
    }

    const notes = this.sequences.get(name);
    if (!notes) {
      return;
    }

    if (state.index >= notes.length) {
      if (state.infinite) {
        state.index = 0;
      } else {
        this.playbackStates.delete(name);
        return;
      }
    }

    const note = notes[state.index];
    state.index++;

    await this.soundPlayer.play(note.frequency, note.duration);

    // Wait for this note to actually be scheduled (audioContext.resume() can
    // take a while, especially the first time) before timing the next one -
    // otherwise a slow resume() lets several notes queue up before any of
    // them is audible, and they all start together once it finally settles.

    if (this.playbackStates.get(name) !== state) {
      return; // stop()/play() replaced this playback while we were waiting
    }

    this.advance(name);
  }

  private clearScheduled(name: string): void {
    const state = this.playbackStates.get(name);
    if (state?.timeoutId !== undefined) {
      clearTimeout(state.timeoutId);
      state.timeoutId = undefined;
    }
  }
}
