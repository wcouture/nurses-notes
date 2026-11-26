import { Pipe, PipeTransform } from '@angular/core';
import { ThemeMode } from '../../models/Theme';

@Pipe({
  name: 'themeString',
})
export class ThemeStringPipe implements PipeTransform {
  transform(value: ThemeMode, ...args: unknown[]): string {
    switch(value) {
        case ThemeMode.Light:
            return "Light";
        case ThemeMode.Dark:
            return "Dark";
        default:
            return "Unknown";
    }
  }
}
