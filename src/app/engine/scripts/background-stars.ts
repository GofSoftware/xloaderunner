import { Script } from '../game-object/script';
import { GameObject } from '../game-object/game-object';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../screen/screen.constants';

const DEFAULT_STAR_COUNT = 10;
const STEP_COUNT = 40;
const STEP_DURATION_SECONDS = 0.1;
const SPEED = 20;

interface IStar {
  x: number;
  y: number;
  step: number;
  elapsedTime: number;
  direction: number;
}

export class BackgroundStars extends Script {
  public static create(gameObject: GameObject, layer: number, starCount: number = DEFAULT_STAR_COUNT): BackgroundStars {
    return new BackgroundStars(gameObject, layer, starCount);
  }

  private static readonly palette: number[] = BackgroundStars.buildPalette();

  private static buildPalette(): number[] {
    return Array.from({ length: STEP_COUNT }, (_, step) => {
      const gray = Math.round((step / (STEP_COUNT - 1)) * 255);
      return ((gray << 24) | (gray << 16) | (gray << 8) | 0xff) >>> 0;
    });
  }

  private static randomStar(init = false): IStar {
    const tensX = init ? SCREEN_WIDTH : (SCREEN_WIDTH / 100) * 10;
    const tensY = init ? SCREEN_HEIGHT : (SCREEN_HEIGHT / 100) * 10;
    return {
      x: SCREEN_WIDTH / 2 + Math.floor(Math.random() * tensX - tensX / 2),
      y: SCREEN_HEIGHT / 2 + Math.floor(Math.random() * tensY - tensY / 2),
      step: Math.floor(Math.random() * STEP_COUNT),
      elapsedTime: 0,
      direction: Math.round(Math.random()),
    };
  }

  private readonly layer: number;
  private readonly stars: IStar[];
  private readonly halfWidth: number;
  private readonly halfHeight: number;

  private constructor(gameObject: GameObject, layer: number, starCount: number) {
    super(gameObject);

    this.halfWidth = SCREEN_WIDTH / 2;
    this.halfHeight = SCREEN_HEIGHT / 2;

    this.layer = layer;
    this.stars = Array.from({ length: starCount }, () => BackgroundStars.randomStar(true));
  }

  public override update(): void {
    const { screenBuffer, deltaTime } = this.gameObject.engineState;

    for (const star of this.stars) {
      star.elapsedTime += deltaTime;
      while (star.elapsedTime >= STEP_DURATION_SECONDS) {
        star.elapsedTime -= STEP_DURATION_SECONDS;
        if (star.direction == 0) {
          star.step++;
        } else {
          star.step--;
        }
        if (star.step >= STEP_COUNT) {
          star.step = STEP_COUNT - 1;
          star.direction = 1;
        }
        if (star.step < 0) {
          star.step = 0;
          star.direction = 0;
          screenBuffer.copy([[BackgroundStars.palette[star.step]]], star.x, star.y, this.layer); // Clear previous
          const newStar = BackgroundStars.randomStar();
          star.x = newStar.x;
          star.y = newStar.y;
        }
      }

      screenBuffer.copy([[BackgroundStars.palette[0]]], star.x, star.y, this.layer); // Clear previous

      this.moveStar(star);

      screenBuffer.copy([[BackgroundStars.palette[star.step]]], star.x, star.y, this.layer);
    }
  }

  private moveStar(star: IStar): void {
    const deltaTime = this.gameObject.engineState.deltaTime;
    const centerX =  (star.x - this.halfWidth);
    const centerY =  (star.y - this.halfHeight);
    const length = Math.sqrt(centerX * centerX + centerY * centerY) || 0.1;
    const normalizedX = centerX / length;
    const normalizedY = centerY / length;

    const adjustedSpeed = SPEED * deltaTime;
    star.x += normalizedX * adjustedSpeed;
    star.y += normalizedY * adjustedSpeed;
    // console.log(normalizedX, normalizedY);
  }
}
