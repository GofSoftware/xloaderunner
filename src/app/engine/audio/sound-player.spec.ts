import { vi } from 'vitest';
import { SoundPlayer } from './sound-player';

describe('SoundPlayer', () => {
  function installFakeAudioContext(resume: () => Promise<void> = () => Promise.resolve()) {
    const oscillator = { type: '', frequency: { setValueAtTime: vi.fn() }, connect: vi.fn(), start: vi.fn() };
    const gain = { gain: { value: 0, setValueAtTime: vi.fn() }, connect: vi.fn() };
    let constructedCount = 0;
    class FakeAudioContext {
      currentTime = 0;
      destination = {};
      resume = resume;
      createOscillator = () => oscillator;
      createGain = () => gain;
      constructor() {
        constructedCount++;
      }
    }
    (globalThis as unknown as { AudioContext: unknown }).AudioContext = FakeAudioContext;
    return { oscillator, gain, getConstructedCount: () => constructedCount };
  }

  afterEach(() => {
    delete (globalThis as unknown as { AudioContext?: unknown }).AudioContext;
    vi.useRealTimers();
  });

  describe('available', () => {
    it('should report false when AudioContext is unavailable', () => {
      expect(SoundPlayer.create().available()).toBe(false);
    });

    it('should report true when AudioContext is available', () => {
      installFakeAudioContext();

      expect(SoundPlayer.create().available()).toBe(true);
    });
  });

  describe('play', () => {
    it('should not throw when AudioContext is unavailable', async () => {
      const soundPlayer = SoundPlayer.create();

      await expect(soundPlayer.play(440, 0.1)).resolves.toBeUndefined();
    });

    it('should create the AudioContext, oscillator, and gain node exactly once, reusing them across calls', async () => {
      vi.useFakeTimers();
      const { oscillator, getConstructedCount } = installFakeAudioContext();
      const soundPlayer = SoundPlayer.create();

      const first = soundPlayer.play(440, 0.1);
      await vi.advanceTimersByTimeAsync(200);
      await first;

      const second = soundPlayer.play(220, 0.1);
      await vi.advanceTimersByTimeAsync(200);
      await second;

      expect(getConstructedCount()).toBe(1);
      expect(oscillator.start).toHaveBeenCalledTimes(1);
    });

    it('should not touch the oscillator/gain until resume() actually settles', async () => {
      let resolveResume: () => void = () => {};
      const resumePromise = new Promise<void>((resolve) => (resolveResume = resolve));
      const { gain } = installFakeAudioContext(() => resumePromise);
      const soundPlayer = SoundPlayer.create();

      const playPromise = soundPlayer.play(440, 0.1);
      await Promise.resolve();
      await Promise.resolve();
      expect(gain.gain.setValueAtTime).not.toHaveBeenCalled();

      resolveResume();
      await playPromise;

      expect(gain.gain.setValueAtTime).toHaveBeenCalledWith(1, 0);
      expect(gain.gain.setValueAtTime).toHaveBeenCalledWith(0, 0.1);
    });

    it('should set the oscillator frequency and open/close the gain envelope for an audible note', async () => {
      vi.useFakeTimers();
      const { oscillator, gain } = installFakeAudioContext();
      const soundPlayer = SoundPlayer.create();

      const playPromise = soundPlayer.play(440, 0.2);
      await vi.advanceTimersByTimeAsync(300);
      await playPromise;

      expect(oscillator.frequency.setValueAtTime).toHaveBeenCalledWith(440, 0);
      expect(gain.gain.setValueAtTime).toHaveBeenNthCalledWith(1, 1, 0);
      expect(gain.gain.setValueAtTime).toHaveBeenNthCalledWith(2, 0, 0.2);
    });

    it('should skip the gain envelope for a silent note (frequency 0) but still wait out its duration', async () => {
      vi.useFakeTimers();
      const { oscillator, gain } = installFakeAudioContext();
      const soundPlayer = SoundPlayer.create();

      const playPromise = soundPlayer.play(0, 0.1);
      await vi.advanceTimersByTimeAsync(200);
      await playPromise;

      expect(oscillator.frequency.setValueAtTime).not.toHaveBeenCalled();
      expect(gain.gain.setValueAtTime).not.toHaveBeenCalled();
    });

    it('should still resolve a later play() call via its own fresh resume(), even if an earlier call on the same player is still waiting on a resume() that never settles', async () => {
      let resumeCallCount = 0;
      const { oscillator } = installFakeAudioContext(() => {
        resumeCallCount++;
        return resumeCallCount === 1 ? new Promise<void>(() => {}) : Promise.resolve();
      });
      const soundPlayer = SoundPlayer.create();

      let firstResolved = false;
      soundPlayer.play(220, 0.1).then(() => (firstResolved = true)); // this one's resume() never settles

      vi.useFakeTimers();
      const secondPlay = soundPlayer.play(440, 0.1); // this one's resume() succeeds
      await vi.advanceTimersByTimeAsync(200);
      await secondPlay;

      expect(oscillator.start).toHaveBeenCalledTimes(1);
      expect(firstResolved).toBe(false);
    });
  });
});
