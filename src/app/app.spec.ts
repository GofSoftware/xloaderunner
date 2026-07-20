import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { SCREEN_WIDTH } from './ui/components/screen/screen.constants';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the screen', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-screen canvas')).toBeTruthy();
  });

  it('should resize the screen and update the header when the window resizes', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const canvas = compiled.querySelector<HTMLCanvasElement>('app-screen canvas')!;

    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 800 });
    window.dispatchEvent(new Event('resize'));
    await fixture.whenStable();

    expect(canvas.style.width).toBe('800px');
    expect(compiled.querySelector('.header__scale')?.textContent).toContain((800 / SCREEN_WIDTH).toFixed(2));
  });
});
