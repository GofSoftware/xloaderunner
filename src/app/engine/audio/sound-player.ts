export class SoundPlayer {
  public static create(): SoundPlayer {
    return new SoundPlayer();
  }

  private audioContext: AudioContext | undefined;
  private oscillator: OscillatorNode | undefined;
  private gain: GainNode | undefined;

  private constructor() {
  }

  public available(): boolean {
    return !(typeof AudioContext === 'undefined');
  }

  /** Resolves once the note has actually been scheduled (i.e. resume() has settled), so callers that play several notes back to back - MusicPlayer - can wait for one note before timing the next, instead of firing them all before any of them is actually audible. */
  public async play(frequency: number, duration: number): Promise<void> {
    if(!(await this.ensureOscillator())) {
      return;
    }

    if (frequency !== 0) {
      this.oscillator!.frequency.setValueAtTime(frequency, this.audioContext!.currentTime);
      this.gain!.gain.setValueAtTime(1, this.audioContext!.currentTime);
      this.gain!.gain.setValueAtTime(0, this.audioContext!.currentTime + duration);
    }

    await this.pause(duration + 0.01);
  }

  private async ensureOscillator(): Promise<boolean> {
    try {
      if (this.oscillator) {
        return true;
      }

      this.audioContext = new AudioContext();
      await this.audioContext.resume();
      this.oscillator = this.audioContext.createOscillator();
      this.oscillator.type = 'square';
      this.gain = this.audioContext.createGain();
      this.gain.gain.value = 0;
      this.oscillator.connect(this.gain);
      this.gain.connect(this.audioContext.destination);

      this.oscillator.start();
      return true;
    } catch (e) {
      console.error(e);
    }
    return false;
  }

  private async pause(duration: number): Promise<void> {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, duration * 1000);
    });
  }
}
