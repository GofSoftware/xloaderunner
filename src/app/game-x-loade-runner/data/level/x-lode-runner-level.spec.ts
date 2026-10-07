import { XLodeRunnerLevel } from './x-lode-runner-level';
import { ___, EnS, PlS, Str } from './level-map-constants';
import { TileElement, Tile } from '../../scripts/tile-map/tile-map-types';
import { TileMap } from '../../scripts/tile-map/tile-map';
import { GameObject } from '../../../engine/game-object/game-object';
import { Keyboard } from '../../../engine/keyboard/keyboard';
import { ScreenBuffer } from '../../../engine/screen/screen-buffer';
import { CELL_SIZE, LAYER_COUNT } from '../../../engine/screen/screen.constants';
import { IEngineState } from '../../../engine/i-engine-state';

class TestLevel extends XLodeRunnerLevel {
  public static create(engineState: IEngineState, map: TileElement[][]): TestLevel {
    return new TestLevel(engineState, map);
  }

  public map: TileElement[][];

  protected constructor(engineState: IEngineState, map: TileElement[][]) {
    super(engineState);
    this.map = map;
  }

  public async initialize(): Promise<GameObject[]> {
    return this.setup();
  }
}

describe('XLodeRunnerLevel', () => {
  let engineState: IEngineState;
  let gameObjectsByName: Map<string, GameObject>;

  beforeEach(() => {
    gameObjectsByName = new Map<string, GameObject>();
    engineState = {
      screenBuffer: ScreenBuffer.create(LAYER_COUNT),
      keyboard: Keyboard.create(),
      soundPlayer: {} as IEngineState['soundPlayer'],
      musicPlayer: { register: () => {}, play: () => {} } as unknown as IEngineState['musicPlayer'],
      deltaTime: 0,
      fps: 0,
      timeFromStart: 0,
      startedAt: 0,
      game: {} as IEngineState['game'],
      addGameObject: () => {},
      removeGameObject: () => {},
      getGameObjectByName: (name: string) => gameObjectsByName.get(name),
      getGameObjectsByName: (name: string) => {
        const gameObject = gameObjectsByName.get(name);
        return gameObject ? [gameObject] : [];
      },
      renameGameObject: () => {},
      reset: () => {},
      registerAfterUpdate: () => {},
    };
  });

  it('spawns one Enemy per EnemyStart tile found on the map', async () => {
    const map: TileElement[][] = [
      [PlS, ___, EnS, ___, EnS],
      [___, ___, ___, ___, ___],
      [Str, Str, Str, Str, Str],
    ];
    const level = TestLevel.create(engineState, map);
    const gameObjects = await level.initialize();

    const enemies = gameObjects.filter((gameObject) => gameObject.name === 'Enemy');
    expect(enemies).toHaveLength(2);
  });

  it('clears every EnemyStart tile back to Empty, not just the first', async () => {
    const map: TileElement[][] = [
      [PlS, ___, EnS, ___, EnS],
      [___, ___, ___, ___, ___],
      [Str, Str, Str, Str, Str],
    ];
    const level = TestLevel.create(engineState, map);
    const gameObjects = await level.initialize();
    gameObjects.forEach((gameObject) => gameObjectsByName.set(gameObject.name, gameObject));
    const tileMap = gameObjectsByName.get('Map')!.getScript(TileMap)!;

    expect(tileMap.getTile(2, 0)).toBe(Tile.Empty);
    expect(tileMap.getTile(4, 0)).toBe(Tile.Empty);
  });

  it('places each spawned Enemy at its own EnemyStart cell', async () => {
    const map: TileElement[][] = [
      [PlS, ___, EnS, ___, EnS],
      [___, ___, ___, ___, ___],
      [Str, Str, Str, Str, Str],
    ];
    const level = TestLevel.create(engineState, map);
    const gameObjects = await level.initialize();

    const enemyPositions = gameObjects
      .filter((gameObject) => gameObject.name === 'Enemy')
      .map((gameObject) => gameObject.position)
      .sort((a, b) => a.x - b.x);

    expect(enemyPositions).toEqual([
      { x: 2 * CELL_SIZE, y: 0 },
      { x: 4 * CELL_SIZE, y: 0 },
    ]);
  });

  it('spawns only one Player even when the map has more than one PlayerStart tile, using the first one found', async () => {
    const map: TileElement[][] = [
      [PlS, ___, ___, PlS, EnS],
      [___, ___, ___, ___, ___],
      [Str, Str, Str, Str, Str],
    ];
    const level = TestLevel.create(engineState, map);
    const gameObjects = await level.initialize();

    const players = gameObjects.filter((gameObject) => gameObject.name === 'Player');
    expect(players).toHaveLength(1);
    expect(players[0].position).toEqual({ x: 0, y: 0 });
  });

  it('clears every PlayerStart tile back to Empty, even the one not used to spawn the player', async () => {
    const map: TileElement[][] = [
      [PlS, ___, ___, PlS, EnS],
      [___, ___, ___, ___, ___],
      [Str, Str, Str, Str, Str],
    ];
    const level = TestLevel.create(engineState, map);
    const gameObjects = await level.initialize();
    gameObjects.forEach((gameObject) => gameObjectsByName.set(gameObject.name, gameObject));
    const tileMap = gameObjectsByName.get('Map')!.getScript(TileMap)!;

    expect(tileMap.getTile(0, 0)).toBe(Tile.Empty);
    expect(tileMap.getTile(3, 0)).toBe(Tile.Empty);
  });
});
