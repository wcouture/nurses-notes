import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewPatientModal } from './new-patient-modal';

describe('NewPatientModal', () => {
  let component: NewPatientModal;
  let fixture: ComponentFixture<NewPatientModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewPatientModal],
    }).compileComponents();

    fixture = TestBed.createComponent(NewPatientModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
