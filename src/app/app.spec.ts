import { TestBed } from '@angular/core/testing';
import { App } from './app';

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

  it('should scale the screen when the header buttons are clicked', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const canvas = compiled.querySelector<HTMLCanvasElement>('app-screen canvas')!;
    const initialWidth = canvas.style.width;

    compiled.querySelector<HTMLButtonElement>('button[aria-label="Increase scale"]')?.click();
    await fixture.whenStable();

    expect(canvas.style.width).not.toBe(initialWidth);
  });
});
