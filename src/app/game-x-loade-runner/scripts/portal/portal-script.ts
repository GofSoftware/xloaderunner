import { GameObject } from '../../../engine/game-object/game-object';
import { BaseScript } from '../base-script';
import { PortalType } from './portal-type';

export class PortalScript extends BaseScript {
  public static create(gameObject: GameObject, portalType: PortalType): PortalScript {
    return new PortalScript(gameObject, portalType);
  }

  private portalType: PortalType;

  private constructor(gameObject: GameObject, portalType: PortalType) {
    super(gameObject);
    this.portalType = portalType;
  }
}
