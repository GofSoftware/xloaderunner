import { Script } from '../../engine/game-object/script';
import { TileMap } from './tile-map/tile-map';
import { TileType } from './tile-map/tile-map-types';
import { MapHelper } from '../helpers/map.helper';
import { BeamScript } from './beam-script';
import { EmitterColor } from './emitter/emitter-color';
import { ParticleScript } from '../../engine/scripts/particle-script';
import { BitmapRenderer } from '../../engine/scripts/renderer/bitmap-renderer';
import { Bl, Gr, Wt } from '../../engine/screen/screen.constants';
import { OnOffScript } from './on-off-script';

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
    this.tile = this.gameObject.engineState.getGameObjectByName('Map')!.getScript(TileMap)!.getTile(column, row);
    if (!SwitchScript.isBeamSwitch(this.tile)) {
      console.warn(`SwitchScript: ${this.gameObject.name} is not a beam switch (tile: ${this.tile})`);
    }
  }

  public override update(): void {
    if (!SwitchScript.isBeamSwitch(this.tile)) {
      this.beamIsOver = true;
      return;
    }
    const { column, row } = MapHelper.screenToMap(this.gameObject.position.x, this.gameObject.position.y);
    this.tileMap.getObjectsAt(column, row).forEach((gameObject) => {
      const beamScript = gameObject.getScript(BeamScript);
      this.beamIsOver =
        beamScript != null &&
        !beamScript.afterCollision &&
        ((this.tile === TileType.BeamSwitchBlue && beamScript.color === EmitterColor.Blue) ||
          (this.tile === TileType.BeamSwitchGreen && beamScript.color === EmitterColor.Green));
    });

    const particleScript = this.gameObject.getScript(ParticleScript);
    if (particleScript != null) {
      particleScript.enabled = this.beamIsOver;
    }

    const bitmapRendererScript = this.gameObject.getScript(BitmapRenderer);
    if (bitmapRendererScript != null) {
      bitmapRendererScript.colorOverrides = this.beamIsOver
        ? [(c) => (c === Wt ? (this.tile === TileType.BeamSwitchBlue ? Bl : Gr) : c)]
        : [(c) => (c === Wt ? c & 0xffffff55 : c)];
    }
    this.gameObject.getScript(OnOffScript)!.on = this.beamIsOver;
  }

  private get tileMap(): TileMap {
    return this.gameObject.engineState.getGameObjectByName('Map')!.getScript(TileMap)!;
  }
}
