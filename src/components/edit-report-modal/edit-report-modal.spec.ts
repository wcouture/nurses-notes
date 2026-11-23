import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditReportModal } from './edit-report-modal';

describe('EditReportModal', () => {
  let component: EditReportModal;
  let fixture: ComponentFixture<EditReportModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditReportModal],
    }).compileComponents();

    fixture = TestBed.createComponent(EditReportModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
