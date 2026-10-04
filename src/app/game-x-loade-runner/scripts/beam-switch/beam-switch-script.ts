import { Script } from '../../../engine/game-object/script';
import { TileMap } from '../tile-map/tile-map';
import { Tile } from '../tile-map/tile-map-types';
import { MapHelper } from '../../helpers/map.helper';
import { BeamScript } from '../beam-script';
import { EmitterColor } from '../emitter/emitter-color';
import { ParticleScript } from '../../../engine/scripts/particle-script';
import { BitmapRenderer } from '../../../engine/scripts/renderer/bitmap-renderer';
import { Bl, Gr, Wt } from '../../../engine/screen/screen.constants';
import { OnOffScript } from '../on-off/on-off-script';

export class BeamSwitchScript extends Script {
  public static create(gameObject: any): BeamSwitchScript {
    return new BeamSwitchScript(gameObject);
  }

  public static isBeamSwitch(tile: Tile): boolean {
    return tile === Tile.BeamSwitchBlue || tile === Tile.BeamSwitchGreen;
  }

  private tile: Tile = Tile.Empty;
  private beamIsOver: boolean = false;

  private constructor(gameObject: any) {
    super(gameObject);
  }

  public override start(): void {
    const { column, row } = MapHelper.screenToMap(this.gameObject.position.x, this.gameObject.position.y);
    this.tile = this.gameObject.engineState.getGameObjectByName('Map')!.getScript(TileMap)!.getTile(column, row);
    if (!BeamSwitchScript.isBeamSwitch(this.tile)) {
      console.warn(`SwitchScript: ${this.gameObject.name} is not a beam switch (tile: ${this.tile})`);
    }
  }

  public override update(): void {
    if (!BeamSwitchScript.isBeamSwitch(this.tile)) {
      this.beamIsOver = false;
      return;
    }
    const { column, row } = MapHelper.screenToMap(this.gameObject.position.x, this.gameObject.position.y);
    this.tileMap.getObjectsAt(column, row).forEach((gameObject) => {
      const beamScript = gameObject.getScript(BeamScript);
      this.beamIsOver =
        beamScript != null &&
        !beamScript.afterCollision &&
        ((this.tile === Tile.BeamSwitchBlue && beamScript.color === EmitterColor.Blue) ||
          (this.tile === Tile.BeamSwitchGreen && beamScript.color === EmitterColor.Green));
    });

    const particleScript = this.gameObject.getScript(ParticleScript);
    if (particleScript != null) {
      particleScript.enabled = this.beamIsOver;
    }

    const bitmapRendererScript = this.gameObject.getScript(BitmapRenderer);
    if (bitmapRendererScript != null) {
      bitmapRendererScript.colorOverrides = this.beamIsOver
        ? [(c) => (c === Wt ? (this.tile === Tile.BeamSwitchBlue ? Bl : Gr) : c)]
        : [(c) => (c === Wt ? c & 0xffffff55 : c)];
    }
    this.gameObject.getScript(OnOffScript)!.on = this.beamIsOver;
  }

  private get tileMap(): TileMap {
    return this.gameObject.engineState.getGameObjectByName('Map')!.getScript(TileMap)!;
  }
}
