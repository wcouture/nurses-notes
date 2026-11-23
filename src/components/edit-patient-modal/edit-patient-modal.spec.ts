import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditPatientModal } from './edit-patient-modal';

describe('EditPatientModal', () => {
  let component: EditPatientModal;
  let fixture: ComponentFixture<EditPatientModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPatientModal],
    }).compileComponents();

    fixture = TestBed.createComponent(EditPatientModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
