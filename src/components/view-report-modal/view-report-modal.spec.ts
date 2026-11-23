import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewReportModal } from './view-report-modal';

describe('ViewReportModal', () => {
  let component: ViewReportModal;
  let fixture: ComponentFixture<ViewReportModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewReportModal],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewReportModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
