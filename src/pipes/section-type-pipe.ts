import { Pipe, PipeTransform } from '@angular/core';
import { SectionType } from '../models/Report';

@Pipe({
  name: 'sectionType',
})
export class SectionTypePipe implements PipeTransform {
  transform(value: SectionType, ...args: unknown[]): string {
    switch (value) {
      case SectionType.ShortText:
        return 'Short Text';
      case SectionType.LongText:
        return 'Long Text';
      case SectionType.Number:
        return 'Number';
      case SectionType.Date:
        return 'Date';
      case SectionType.Checkbox:
        return 'Checkbox';
      case SectionType.RadioButtons:
        return 'Radio Buttons';
      case SectionType.Duration:
        return 'Duration';
      default:
        return '';
    }
  }
}
