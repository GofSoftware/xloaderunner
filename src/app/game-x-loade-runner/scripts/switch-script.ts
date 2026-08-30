import { Script } from '../../engine/game-object/script';
import { TileMap } from './tile-map/tile-map';
import { TileType } from './tile-map/tile-map-types';
import { MapHelper } from '../helpers/map.helper';

export class SwitchScript extends Script {
  public static create(gameObject: any): SwitchScript {
    return new SwitchScript(gameObject);
  }

  public static isBeamSwitch(tile: TileType): boolean {
    return tile === TileType.BeamSwitchBlue || tile === TileType.BeamSwitchGreen;
  }

  private tile: TileType = TileType.Empty;
  private beamIsOver: boolean = false;

  private constructor(gameObject: any) {
    super(gameObject);
  }

  public override start(): void {
    const { column, row } = MapHelper.screenToMap(this.gameObject.position.x, this.gameObject.position.y);
    const tile = this.gameObject.engineState.getGameObjectByName('Map')!.getScript(TileMap)!.getTile(column, row);
    if (!SwitchScript.isBeamSwitch(tile)) {
      console.warn(`SwitchScript: ${this.gameObject.name} is not a beam switch (tile: ${tile})`);
    }
  }

  public override update(): void {
    if (!SwitchScript.isBeamSwitch(this.tile)) {
      return;
    }
    this.tileMap.getObjectsAt(this.gameObject.position.x, this.gameObject.position.y).forEach((gameObject) => {
      if (gameObject.getScript(SwitchScript) === this) {
        this.beamIsOver = true;
      }
    });
  }

  public isOn(): boolean {
    return this.beamIsOver;
  }

  private get tileMap(): TileMap {
    return this.gameObject.engineState.getGameObjectByName('Map')!.getScript(TileMap)!;
  }
}
