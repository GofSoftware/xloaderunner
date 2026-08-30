import { Engine } from '../engine/engine';
import { XLodeRunner } from './x-lode-runner';
import { TileMap } from './scripts/tile-map/tile-map';
import { TileType } from './scripts/tile-map/tile-map-types';

describe('XLodeRunner', () => {
  afterEach(() => {
    Engine.instance.stop();
  });

  it('should clear the PlayerStart tile back to Empty, so BuilderScript can build on the spawn cell', async () => {
    await Engine.instance.start(XLodeRunner.create());

    const tileMap = Engine.instance.getGameObjectByName('Map')!.getScript(TileMap)!;
    for (let row = 0; row < tileMap.rows; row++) {
      for (let column = 0; column < tileMap.columns; column++) {
        expect(tileMap.getTile(column, row)).not.toBe(TileType.PlayerStart);
      }
    }
  });
});
