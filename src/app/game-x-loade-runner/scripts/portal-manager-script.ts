import { GameObject } from '../../engine/game-object/game-object';
import { PortalType } from './portal/portal-type';
import { ObjectPosition } from './object-position';
import { Direction, DIRECTION_SHIFT, shiftByDirection } from './direction';
import { BaseScript } from './base-script';
import { TileType } from './tile-map/tile-map-types';
import { MapHelper } from '../helpers/map.helper';
import { PortalScript } from './portal/portal-script';
import { BitmapRenderer } from '../../engine/scripts/renderer/bitmap-renderer';
import { OBJECT_PORTAL_01, OBJECT_PORTAL_PROJECTILE } from '../data/sprites';
import { BACKGROUND_LAYER, Bk } from '../../engine/screen/screen.constants';
import { BeamScript } from './beam-script';
import { RunnerScript } from './runner-script';
import { IMapPosition } from './tile-map/i-map-position';

export const BLUE_PORTAL_GAME_OBJECT_NAME = 'BluePortal';
export const ORANGE_PORTAL_GAME_OBJECT_NAME = 'OrangePortal';
export const ORANGE_PORTAL_PROJECTILE_GAME_OBJECT_NAME = 'portalProjectileOrange';
export const BLUE_PORTAL_PROJECTILE_GAME_OBJECT_NAME = 'portalProjectileBlue';

const PORTAL_SPEED = 100;

interface IPortalProjectile {
  portalType: PortalType;
  objectPosition: ObjectPosition;
  gameObject: GameObject;
  direction: Direction;
}

export class PortalManagerScript extends BaseScript {
  public static create(gameObject: GameObject): PortalManagerScript {
    return new PortalManagerScript(gameObject);
  }

  private projectiles: IPortalProjectile[] = [];
  private orangePortal: GameObject | null = null;
  private bluePortal: GameObject | null = null;

  private constructor(gameObject: GameObject) {
    super(gameObject);
  }

  public override update() {
    super.update();

    if (this.gameObject.engineState.keyboard.wasPressedThisFrame('KeyO')) {
      this.fireProjectile(PortalType.Orange);
    }
    if (this.gameObject.engineState.keyboard.wasPressedThisFrame('KeyP')) {
      this.fireProjectile(PortalType.Blue);
    }

    this.processProjectiles();
  }

  public isOnPortal(column: number, row: number): boolean {
    if (this.bluePortal != null) {
      const pos = this.bluePortal.getScript(ObjectPosition);
      if (pos?.column === column && pos?.row === row) {
        return true;
      }
    }
    if (this.orangePortal != null) {
      const pos = this.orangePortal.getScript(ObjectPosition);
      if (pos?.column === column && pos?.row === row) {
        return true;
      }
    }
    return false;
  }

  public calcTeleportation(direction: Direction, position: IMapPosition): { direction: Direction, position: IMapPosition } | null {
    const { column, row } = position;
    if (!this.isOnPortal(column, row)) {
      return null;
    }
    const destinationPosition = this.getDestinationPortalPosition(column, row);
    if (destinationPosition == null) {
      return null;
    }

    const directions = [direction, Direction.Left, Direction.Right, Direction.Up, Direction.Down];
    for (const direction of directions) {
      const shift = DIRECTION_SHIFT.get(direction)!;
      const shiftedPosition = { column: destinationPosition.column + shift.shiftColumn, row: destinationPosition.row + shift.shiftRow };
      const destTile = this.tileMap.getTile(shiftedPosition.column, shiftedPosition.row);
      if (destTile !== TileType.Brick && destTile !== TileType.Lava) {
        return { direction, position: destinationPosition };
      }
    }

    return null;
  }

  private fireProjectile(portalType: PortalType) {
    const projectileGameObject = this.spawnProjectile(this.playerPosition.column, this.playerPosition.row, portalType);

    this.projectiles.push({
      portalType,
      objectPosition: projectileGameObject.getScript(ObjectPosition)!,
      direction: this.playerState.direction,
      gameObject: projectileGameObject,
    });
  }

  private processProjectiles() {
    const projectilesArray = [...this.projectiles];
    for (const projectile of projectilesArray) {
      if (projectile.objectPosition.isMoving) {
        continue;
      }
      const { column, row } = shiftByDirection(projectile.objectPosition.column, projectile.objectPosition.row, projectile.direction);
      const tile = this.tileMap.getTile(column, row);

      if (this.isBlocker(tile, column, row)) {
        this.removeProjectile(projectile);
        return;
      }

      if (this.isPortableSurface(tile)) {
        if (!this.isEmpty(projectile.objectPosition.column, projectile.objectPosition.row)) {
          this.removeProjectile(projectile);
          return;
        }

        if (projectile.portalType === PortalType.Blue) {
          this.gameObject.engineState.removeGameObject(this.bluePortal!);
          this.bluePortal = this.spawnPortal(projectile.objectPosition.column, projectile.objectPosition.row, PortalType.Blue);
        } else {
          this.gameObject.engineState.removeGameObject(this.orangePortal!);
          this.orangePortal = this.spawnPortal(projectile.objectPosition.column, projectile.objectPosition.row, PortalType.Orange);
        }

        this.removeProjectile(projectile);
      }
      projectile.objectPosition.moveTo(column, row, PORTAL_SPEED);
    }
  }

  private spawnPortal(column: number, row: number, portalType: PortalType): GameObject {
    const gameObject = GameObject.create(
      portalType === PortalType.Blue ? BLUE_PORTAL_GAME_OBJECT_NAME : ORANGE_PORTAL_GAME_OBJECT_NAME,
      this.gameObject.engineState,
      MapHelper.mapToScreen(column, row),
      [
        (gameObject: GameObject) => {
          return PortalScript.create(gameObject, portalType);
        },
        (gameObject: GameObject) => {
          return ObjectPosition.create(gameObject, column, row);
        },
        (gameObject: GameObject) => {
          return BitmapRenderer.create(gameObject, OBJECT_PORTAL_01, BACKGROUND_LAYER, [
            (color) => (color !== Bk ? color : portalType === PortalType.Blue ? 0x0000ffff : 0xff0000ff),
          ]);
        },
      ],
    );
    this.gameObject.engineState.addGameObject(gameObject);
    return gameObject;
  }

  private spawnProjectile(column: number, row: number, portalType: PortalType): GameObject {
    const gameObject = GameObject.create(
      portalType === PortalType.Blue ? BLUE_PORTAL_PROJECTILE_GAME_OBJECT_NAME : ORANGE_PORTAL_PROJECTILE_GAME_OBJECT_NAME,
      this.gameObject.engineState,
      MapHelper.mapToScreen(column, row),
      [
        (gameObject: GameObject) => ObjectPosition.create(gameObject, column, row),
        (gameObject: GameObject) => {
          return BitmapRenderer.create(gameObject, OBJECT_PORTAL_PROJECTILE, BACKGROUND_LAYER, [
            (color) => (color !== Bk ? color : portalType === PortalType.Blue ? 0x0000ffff : 0xff0000ff),
          ]);
        },
      ],
    );
    this.gameObject.engineState.addGameObject(gameObject);
    return gameObject;
  }

  private removeProjectile(projectile: IPortalProjectile) {
    this.gameObject.engineState.removeGameObject(projectile.gameObject);
    const pIndex = this.projectiles.indexOf(projectile);
    if (pIndex > -1) {
      this.projectiles.splice(pIndex, 1);
    }
  }

  private isBlocker(tile: TileType, column: number, row: number): boolean {
    const gameObjects = this.tileMap.getObjectsAt(column, row);
    return (
      !this.tileMap.isInBounds(column, row) ||
      tile === TileType.GoldenGates ||
      gameObjects.some((gameObject) => gameObject.getScript(RunnerScript) != null)
    );
  }

  private getDestinationPortalPosition(currentColumn: number, currentRow: number): IMapPosition | null {
    const {column: blueColumn, row: blueRow} = this.bluePortal?.getScript(ObjectPosition) ?? {column: -1, row: -1};
    const {column: orangeColumn, row: orangeRow} = this.orangePortal?.getScript(ObjectPosition) ?? {column: -1, row: -1};

    let destinationPosition: IMapPosition = {column: -1, row: -1};

    if (currentColumn === blueColumn && currentRow === blueRow) {
      destinationPosition = {column: orangeColumn, row: orangeRow};
    } else if (currentColumn === orangeColumn && orangeRow === orangeRow){
      destinationPosition = {column: blueColumn, row: blueRow};
    }

    if (destinationPosition.column !== -1) {
      return destinationPosition;
    }

    return null;
  }

  private isEmpty(column: number, row: number): boolean {
    const gameObjects = this.tileMap.getObjectsAt(column, row).filter((gameObject) => {
      return (
        gameObject.name !== ORANGE_PORTAL_PROJECTILE_GAME_OBJECT_NAME &&
        gameObject.name !== BLUE_PORTAL_PROJECTILE_GAME_OBJECT_NAME &&
        gameObject.getScript(BeamScript) == null
      );
    });
    return this.tileMap.getTile(column, row) === TileType.Empty && gameObjects.length === 0 && !this.isOnPortal(column, row);
  }

  private isPortableSurface(tile: TileType): boolean {
    return tile === TileType.Brick || tile === TileType.Stairs;
  }
}
