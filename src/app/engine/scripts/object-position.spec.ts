import { ObjectPosition } from './object-position';
import { TileMap } from '../../game-x-loade-runner/scripts/tile-map';
import { MapHelper } from '../helpers/map.helper';
import { GameObject } from '../game-object/game-object';
import { IEngineState } from '../i-engine-state';

describe('ObjectPosition', () => {
  let engineState: IEngineState;
  let tileMap: TileMap;

  beforeEach(() => {
    const gameObjectsByName = new Map<string, GameObject>();
    engineState = {
      deltaTime: 0,
      addGameObject: () => {},
      removeGameObject: () => {},
      getGameObjectByName: (name: string) => gameObjectsByName.get(name),
    } as unknown as IEngineState;

    const mapGameObject = GameObject.create('Map', engineState, { x: 0, y: 0 }, [(go) => TileMap.create(go)]);
    tileMap = mapGameObject.getScript(TileMap)!;
    gameObjectsByName.set('Map', mapGameObject);
  });

  function createTracked(column: number, row: number): { gameObject: GameObject; objectPosition: ObjectPosition } {
    const gameObject = GameObject.create('Tracked', engineState, MapHelper.mapToScreen(column, row), [
      (go) => ObjectPosition.create(go, column, row),
    ]);
    gameObject.start();
    return { gameObject, objectPosition: gameObject.getScript(ObjectPosition)! };
  }

  it('should register in the tile map and snap the pixel position on start', () => {
    const { gameObject, objectPosition } = createTracked(2, 3);

    expect(tileMap.getObjectsAt(2, 3)).toEqual([gameObject]);
    expect(gameObject.position).toEqual(MapHelper.mapToScreen(2, 3));
    expect(objectPosition.column).toBe(2);
    expect(objectPosition.row).toBe(3);
  });

  it('should update the tile map immediately on moveTo, before any pixel interpolation happens', () => {
    const { gameObject, objectPosition } = createTracked(2, 3);

    objectPosition.moveTo(3, 3, 40);

    expect(tileMap.getObjectsAt(2, 3)).toEqual([]);
    expect(tileMap.getObjectsAt(3, 3)).toEqual([gameObject]);
    expect(gameObject.position).toEqual(MapHelper.mapToScreen(2, 3));
    expect(objectPosition.isMoving).toBe(true);
  });

  it('should smoothly interpolate the pixel position toward the target across multiple updates', () => {
    const { gameObject, objectPosition } = createTracked(0, 0);
    objectPosition.moveTo(1, 0, 40);

    engineState.deltaTime = 0.1;
    objectPosition.update();
    expect(gameObject.position).toEqual({ x: 4, y: 0 });
    expect(objectPosition.isMoving).toBe(true);

    objectPosition.update();
    expect(gameObject.position).toEqual({ x: 8, y: 0 });
    expect(objectPosition.isMoving).toBe(false);
  });

  it('should not overshoot the target when deltaTime covers more than the remaining distance', () => {
    const { gameObject, objectPosition } = createTracked(0, 0);
    objectPosition.moveTo(1, 0, 40);

    engineState.deltaTime = 10;
    objectPosition.update();

    expect(gameObject.position).toEqual(MapHelper.mapToScreen(1, 0));
    expect(objectPosition.isMoving).toBe(false);
  });

  it('should teleport instantly, updating both the registry and the pixel position with no interpolation', () => {
    const { gameObject, objectPosition } = createTracked(0, 0);

    objectPosition.teleportTo(5, 5);

    expect(tileMap.getObjectsAt(0, 0)).toEqual([]);
    expect(tileMap.getObjectsAt(5, 5)).toEqual([gameObject]);
    expect(gameObject.position).toEqual(MapHelper.mapToScreen(5, 5));
    expect(objectPosition.isMoving).toBe(false);
  });

  it('should cancel any in-flight transition when teleported', () => {
    const { objectPosition } = createTracked(0, 0);
    objectPosition.moveTo(2, 0, 40);

    objectPosition.teleportTo(5, 5);

    expect(objectPosition.isMoving).toBe(false);
  });

  it('should remove the object from its current cell on destroy', () => {
    const { gameObject } = createTracked(2, 3);

    gameObject.destroy();

    expect(tileMap.getObjectsAt(2, 3)).toEqual([]);
  });
});
