import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
})
export class DateFormatPipe implements PipeTransform {
  transform(date: Date | string | null | undefined): string {
    console.log("Transforming date:", date);

    if (!date) {
      return 'None';
    }

    if (typeof date === 'string') {
      try {
        const parts = date.split('-').map(Number);
        if (parts.length === 3) {
          date = new Date(parts[0], parts[1] - 1, parts[2]);
        }
      } catch (error) {
        console.error("Error parsing date string:", error);
        return 'Invalid date';
      }
    }

    console.log("Date after conversion if needed:", date);

    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return (date as Date).toLocaleDateString(undefined, options);
  }
}
