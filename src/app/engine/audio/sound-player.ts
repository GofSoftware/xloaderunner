export class SoundPlayer {
  public static create(): SoundPlayer {
    return new SoundPlayer();
  }

  private audioContext: AudioContext | undefined;

  private constructor() {}

  public play(frequency: number, duration: number): void {
    const audioContext = this.audioContext ?? (this.audioContext = new AudioContext());
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'square';
    oscillator.frequency.value = frequency;
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  }
}
