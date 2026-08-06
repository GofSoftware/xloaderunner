import { MusicPlayer } from './music-player';
import { SoundPlayer } from './sound-player';
import { IMusicNote } from './i-music-note';

describe('MusicPlayer', () => {
  let playCalls: Array<{ frequency: number; duration: number }>;
  let playResolvers: Array<() => void>;
  let soundPlayer: SoundPlayer;

  function createControllableSoundPlayer(): SoundPlayer {
    playCalls = [];
    playResolvers = [];
    return {
      play: (frequency: number, duration: number) => {
        playCalls.push({ frequency, duration });
        return new Promise<void>((resolve) => {
          playResolvers.push(resolve);
        });
      },
    } as unknown as SoundPlayer;
  }

  beforeEach(() => {
    soundPlayer = createControllableSoundPlayer();
  });

  it('should not start the next note until the current one has actually been scheduled - i.e. until soundPlayer.play() resolves', async () => {
    const notes: IMusicNote[] = [
      { frequency: 100, duration: 0.1 },
      { frequency: 200, duration: 0.1 },
    ];
    const musicPlayer = MusicPlayer.create(soundPlayer);
    musicPlayer.register('Test', notes);

    musicPlayer.play('Test');
    expect(playCalls).toEqual([{ frequency: 100, duration: 0.1 }]);

    // Nothing but the first note's play() promise gates the second one - it
    // must not be requested while that promise is still pending.
    await Promise.resolve();
    await Promise.resolve();
    expect(playCalls.length).toBe(1);

    playResolvers[0]();
    await Promise.resolve();
    await Promise.resolve();

    expect(playCalls).toEqual([
      { frequency: 100, duration: 0.1 },
      { frequency: 200, duration: 0.1 },
    ]);
  });

  it('should still call soundPlayer.play() for a silent note - SoundPlayer itself decides how to render frequency 0 - and advance once it resolves', async () => {
    const notes: IMusicNote[] = [
      { frequency: 0, duration: 0.2 },
      { frequency: 300, duration: 0.1 },
    ];
    const musicPlayer = MusicPlayer.create(soundPlayer);
    musicPlayer.register('Test', notes);

    musicPlayer.play('Test');
    expect(playCalls).toEqual([{ frequency: 0, duration: 0.2 }]);

    playResolvers[0]();
    await Promise.resolve();
    await Promise.resolve();

    expect(playCalls).toEqual([
      { frequency: 0, duration: 0.2 },
      { frequency: 300, duration: 0.1 },
    ]);
  });

  it('should stop advancing once stop() is called, even if a pending note resolves afterwards', async () => {
    const notes: IMusicNote[] = [
      { frequency: 100, duration: 0.1 },
      { frequency: 200, duration: 0.1 },
    ];
    const musicPlayer = MusicPlayer.create(soundPlayer);
    musicPlayer.register('Test', notes);

    musicPlayer.play('Test');
    expect(playCalls.length).toBe(1);

    musicPlayer.stop('Test');

    playResolvers[0]();
    await Promise.resolve();
    await Promise.resolve();

    expect(playCalls.length).toBe(1);
  });

  it('should stop advancing the old sequence if play() is called again while a note is still pending', async () => {
    const notes: IMusicNote[] = [
      { frequency: 100, duration: 0.1 },
      { frequency: 200, duration: 0.1 },
    ];
    const musicPlayer = MusicPlayer.create(soundPlayer);
    musicPlayer.register('Test', notes);

    musicPlayer.play('Test'); // old sequence, first note pending
    expect(playCalls.length).toBe(1);

    musicPlayer.play('Test'); // restart while the old note is still pending
    expect(playCalls.length).toBe(2);

    // Resolve the OLD (now-abandoned) sequence's pending note.
    playResolvers[0]();
    await Promise.resolve();
    await Promise.resolve();

    // The old sequence must not have advanced to its second note (200Hz) -
    // no further calls should have happened at all.
    expect(playCalls.length).toBe(2);
  });
});
