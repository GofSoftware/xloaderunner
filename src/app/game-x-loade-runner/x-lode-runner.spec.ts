import { Engine } from '../engine/engine';
import { XLodeRunnerGame } from './x-lode-runner-game';
import { XLodeRunnerLevel1 } from './data/level/x-lode-runner-level-1';
import { TileMap } from './scripts/tile-map/tile-map';
import { Tile } from './scripts/tile-map/tile-map-types';

describe('XLodeRunner', () => {
  afterEach(() => {
    Engine.instance.stop();
  });

  it('should clear the PlayerStart tile back to Empty, so BuilderScript can build on the spawn cell', async () => {
    const game = XLodeRunnerGame.create();
    await Engine.instance.start(game);
    // Engine.start() lands on the start menu first - go straight to the real level, since that's
    // what this test actually cares about, rather than simulating a keypress through the menu.
    await game.startLevel(XLodeRunnerLevel1.create(Engine.instance));

    const tileMap = Engine.instance.getGameObjectByName('Map')!.getScript(TileMap)!;
    for (let row = 0; row < tileMap.rows; row++) {
      for (let column = 0; column < tileMap.columns; column++) {
        expect(tileMap.getTile(column, row)).not.toBe(Tile.PlayerStart);
      }
    }
  });
});
