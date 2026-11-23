import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GenReportTableModal } from './gen-report-table-modal';

describe('GenReportTableModal', () => {
  let component: GenReportTableModal;
  let fixture: ComponentFixture<GenReportTableModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenReportTableModal],
    }).compileComponents();

    fixture = TestBed.createComponent(GenReportTableModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
