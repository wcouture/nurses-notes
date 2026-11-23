import { Pipe, PipeTransform } from '@angular/core';
import { ReportScope } from '../models/Report';

@Pipe({
  name: 'reportScope',
})
export class ReportScopePipe implements PipeTransform {
  transform(value: ReportScope, ...args: unknown[]): string {
    switch (value) {
      case ReportScope.Patient:
        return 'Patient';
      case ReportScope.User:
        return 'User';
      default:
        return '';
    }
  }
}
