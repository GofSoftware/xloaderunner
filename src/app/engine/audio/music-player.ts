import { IMusicNote } from './i-music-note';
import { SoundPlayer } from './sound-player';

const C4 = 261.63;
const D4 = 293.66;
const E4 = 329.63;
const F4 = 349.23;
const G4 = 392.0;
const A4 = 440.0;

export const DEATH_JINGLE: IMusicNote[] = [
  { frequency: G4, duration: 0.15 },
  { frequency: F4, duration: 0.15 },
  { frequency: D4, duration: 0.15 },
  { frequency: C4, duration: 0.4 },
];

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

  public play(name: string, from: number = 0): void {
    this.clearScheduled(name);
    this.playbackStates.set(name, { index: from, timeoutId: undefined });
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
    if (!notes || state.index >= notes.length) {
      this.playbackStates.delete(name);
      return;
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
