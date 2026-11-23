import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportSectionInput } from './report-section-input';

describe('ReportSectionInput', () => {
  let component: ReportSectionInput;
  let fixture: ComponentFixture<ReportSectionInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportSectionInput],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportSectionInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
