import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DurationInput } from './duration-input';

describe('DurationInput', () => {
  let component: DurationInput;
  let fixture: ComponentFixture<DurationInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DurationInput],
    }).compileComponents();

    fixture = TestBed.createComponent(DurationInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
