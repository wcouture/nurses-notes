import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientPanel } from './patient-panel';

describe('PatientPanel', () => {
  let component: PatientPanel;
  let fixture: ComponentFixture<PatientPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
