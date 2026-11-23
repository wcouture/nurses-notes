import { TestBed } from '@angular/core/testing';
import { ReportBuilder } from './report-builder';

describe('ReportBuilder', () => {
  let service: ReportBuilder;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportBuilder);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
