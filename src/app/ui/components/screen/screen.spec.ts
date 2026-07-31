import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Screen } from './screen';
import { LAYER_COUNT, SCREEN_HEIGHT, SCREEN_WIDTH } from '../../../engine/screen/screen.constants';

describe('Screen', () => {
  let component: Screen;
  let fixture: ComponentFixture<Screen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Screen],
    }).compileComponents();

    fixture = TestBed.createComponent(Screen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create one stacked canvas per engine layer', () => {
    const canvases = (fixture.nativeElement as HTMLElement).querySelectorAll('canvas');
    expect(canvases.length).toBe(LAYER_COUNT);
  });

  it('should size the canvas to the window width, preserving the screen aspect ratio', async () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 512 });
    window.dispatchEvent(new Event('resize'));
    await fixture.whenStable();

    const canvas = (fixture.nativeElement as HTMLElement).querySelector('canvas')!;
    expect(canvas.style.width).toBe('512px');
    expect(canvas.style.height).toBe(`${(512 * SCREEN_HEIGHT) / SCREEN_WIDTH}px`);
  });

  it('should emit scaleChange when the window is resized', async () => {
    const emitted: number[] = [];
    component.scaleChange.subscribe((value) => emitted.push(value));

    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    window.dispatchEvent(new Event('resize'));
    await fixture.whenStable();

    expect(emitted.at(-1)).toBe(1024 / SCREEN_WIDTH);
  });
});
