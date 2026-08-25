import { vi } from 'vitest';
import { EnemyScript } from './enemy-script';
import { StateScript } from './state-script';
import { ObjectPosition } from '../../engine/scripts/object-position';
import { TileMap, TileType } from './tile-map';
import { GameObject } from '../../engine/game-object/game-object';
import { Keyboard } from '../../engine/keyboard/keyboard';
import { ScreenBuffer } from '../../engine/screen/screen-buffer';
import { LAYER_COUNT } from '../../engine/screen/screen.constants';
import { IEngineState } from '../../engine/i-engine-state';

describe('EnemyScript', () => {
  let engineState: IEngineState;
  let keyboard: Keyboard;
  let tileMap: TileMap;
  let gameObjectsByName: Map<string, GameObject>;

  function createFloor(row: number, fromColumn: number, toColumn: number): void {
    for (let column = fromColumn; column <= toColumn; column++) {
      tileMap.setTile(column, row, TileType.Brick);
    }
  }

  function createPlayer(column: number, row: number): GameObject {
    const gameObject = GameObject.create('Player', engineState, { x: column * 8, y: row * 8 }, [
      (go) => ObjectPosition.create(go, column, row),
    ]);
    gameObject.start();
    gameObjectsByName.set('Player', gameObject);
    return gameObject;
  }

  function createEnemy(column: number, row: number): GameObject {
    const gameObject = GameObject.create('Enemy', engineState, { x: column * 8, y: row * 8 }, [
      (go) => EnemyScript.create(go),
      (go) => StateScript.create(go, { column, row }),
      (go) => ObjectPosition.create(go, column, row),
    ]);
    gameObject.start();
    gameObjectsByName.set('Enemy', gameObject);
    return gameObject;
  }

  function spyOnForces(stateScript: StateScript): Record<'left' | 'right' | 'up' | 'down', ReturnType<typeof vi.spyOn>> {
    return {
      left: vi.spyOn(stateScript, 'forceLeft'),
      right: vi.spyOn(stateScript, 'forceRight'),
      up: vi.spyOn(stateScript, 'forceUp'),
      down: vi.spyOn(stateScript, 'forceDown'),
    };
  }

  beforeEach(() => {
    keyboard = Keyboard.create();
    keyboard.attach();
    gameObjectsByName = new Map<string, GameObject>();
    engineState = {
      screenBuffer: ScreenBuffer.create(LAYER_COUNT),
      keyboard,
      soundPlayer: {} as IEngineState['soundPlayer'],
      musicPlayer: {} as IEngineState['musicPlayer'],
      deltaTime: 1,
      fps: 0,
      timeFromStart: 0,
      startedAt: 0,
      addGameObject: () => {},
      removeGameObject: () => {},
      getGameObjectByName: (name: string) => gameObjectsByName.get(name),
    };

    const mapGameObject = GameObject.create('Map', engineState, { x: 0, y: 0 }, [(go) => TileMap.create(go)]);
    tileMap = mapGameObject.getScript(TileMap)!;
    gameObjectsByName.set('Map', mapGameObject);
  });

  afterEach(() => {
    keyboard.detach();
  });

  it('forces right when the player is further along the same grounded row', () => {
    createFloor(6, 0, 10);
    createPlayer(8, 5);
    const enemy = createEnemy(2, 5);
    const stateScript = enemy.getScript(StateScript)!;
    const forces = spyOnForces(stateScript);

    enemy.getScript(EnemyScript)!.update();

    expect(forces.right).toHaveBeenCalledWith(true);
    expect(forces.left).toHaveBeenCalledWith(false);
    expect(forces.up).toHaveBeenCalledWith(false);
    expect(forces.down).toHaveBeenCalledWith(false);
  });

  it('forces left when the player is behind on the same grounded row', () => {
    createFloor(6, 0, 10);
    createPlayer(2, 5);
    const enemy = createEnemy(8, 5);
    const stateScript = enemy.getScript(StateScript)!;
    const forces = spyOnForces(stateScript);

    enemy.getScript(EnemyScript)!.update();

    expect(forces.left).toHaveBeenCalledWith(true);
    expect(forces.right).toHaveBeenCalledWith(false);
  });

  it('forces up to climb stairs toward a player standing above', () => {
    tileMap.setTile(4, 4, TileType.Stairs);
    tileMap.setTile(4, 5, TileType.Stairs);
    createPlayer(4, 3);
    const enemy = createEnemy(4, 5);
    const stateScript = enemy.getScript(StateScript)!;
    const forces = spyOnForces(stateScript);

    enemy.getScript(EnemyScript)!.update();

    expect(forces.up).toHaveBeenCalledWith(true);
    expect(forces.left).toHaveBeenCalledWith(false);
    expect(forces.right).toHaveBeenCalledWith(false);
    expect(forces.down).toHaveBeenCalledWith(false);
  });

  it('forces down to fall toward a player standing below', () => {
    createFloor(6, 0, 10);
    createPlayer(4, 5);
    const enemy = createEnemy(4, 2);
    const stateScript = enemy.getScript(StateScript)!;
    const forces = spyOnForces(stateScript);

    enemy.getScript(EnemyScript)!.update();

    expect(forces.down).toHaveBeenCalledWith(true);
    expect(forces.left).toHaveBeenCalledWith(false);
    expect(forces.right).toHaveBeenCalledWith(false);
    expect(forces.up).toHaveBeenCalledWith(false);
  });

  it('clears every force once the enemy already stands on the player cell', () => {
    createPlayer(4, 5);
    const enemy = createEnemy(4, 5);
    const stateScript = enemy.getScript(StateScript)!;
    const forces = spyOnForces(stateScript);

    enemy.getScript(EnemyScript)!.update();

    expect(forces.left).toHaveBeenCalledWith(false);
    expect(forces.right).toHaveBeenCalledWith(false);
    expect(forces.up).toHaveBeenCalledWith(false);
    expect(forces.down).toHaveBeenCalledWith(false);
  });

  it('leaves every force false when no path to the player exists', () => {
    createFloor(6, 0, 10);
    for (let row = 0; row <= 6; row++) {
      tileMap.setTile(5, row, TileType.Brick);
    }
    createPlayer(8, 5);
    const enemy = createEnemy(2, 5);
    const stateScript = enemy.getScript(StateScript)!;
    const forces = spyOnForces(stateScript);

    enemy.getScript(EnemyScript)!.update();

    expect(forces.left).toHaveBeenCalledWith(false);
    expect(forces.right).toHaveBeenCalledWith(false);
    expect(forces.up).toHaveBeenCalledWith(false);
    expect(forces.down).toHaveBeenCalledWith(false);
  });

  it('falls first instead of walking across open air, even when the player is a straight hop away', () => {
    // Column 6 is a staircase from row 5 down to row 8, with a floor below it - the only way from
    // (2, 5) to the player at (6, 5) is to fall to the floor, walk under the stairs, then climb
    // back up, never a direct horizontal step through the open air in between.
    for (let row = 5; row <= 8; row++) {
      tileMap.setTile(6, row, TileType.Stairs);
    }
    createFloor(9, 0, 10);
    createPlayer(6, 5);
    const enemy = createEnemy(2, 5);
    const stateScript = enemy.getScript(StateScript)!;
    const forces = spyOnForces(stateScript);

    enemy.getScript(EnemyScript)!.update();

    expect(forces.down).toHaveBeenCalledWith(true);
    expect(forces.right).toHaveBeenCalledWith(false);
    expect(forces.left).toHaveBeenCalledWith(false);
    expect(forces.up).toHaveBeenCalledWith(false);
  });

  it('treats a temporarily-blasted brick as solid ground and walks out over the hole, unlike StateScript', () => {
    createFloor(6, 0, 10);
    tileMap.setTile(5, 6, TileType.BlastedBrick);
    createPlayer(8, 5);
    const enemy = createEnemy(2, 5);
    const stateScript = enemy.getScript(StateScript)!;
    const forces = spyOnForces(stateScript);

    enemy.getScript(EnemyScript)!.update();

    expect(forces.right).toHaveBeenCalledWith(true);
    expect(forces.left).toHaveBeenCalledWith(false);
    expect(forces.up).toHaveBeenCalledWith(false);
    expect(forces.down).toHaveBeenCalledWith(false);
  });
});
