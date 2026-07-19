import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Header } from './header';
import { SCALE_MAX, SCALE_MIN } from '../screen/screen.constants';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  function clickButton(label: 'Decrease scale' | 'Increase scale'): void {
    const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      `button[aria-label="${label}"]`,
    );
    button?.click();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should increase and decrease the scale', async () => {
    const initial = component.scale();

    clickButton('Increase scale');
    await fixture.whenStable();
    expect(component.scale()).toBe(initial + 1);

    clickButton('Decrease scale');
    await fixture.whenStable();
    expect(component.scale()).toBe(initial);
  });

  it('should clamp the scale between SCALE_MIN and SCALE_MAX', async () => {
    component.scale.set(SCALE_MIN);
    clickButton('Decrease scale');
    await fixture.whenStable();
    expect(component.scale()).toBe(SCALE_MIN);

    component.scale.set(SCALE_MAX);
    clickButton('Increase scale');
    await fixture.whenStable();
    expect(component.scale()).toBe(SCALE_MAX);
  });
});
