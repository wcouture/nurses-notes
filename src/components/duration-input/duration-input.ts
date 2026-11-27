import { Component, signal, input, inject } from '@angular/core';
import { ThemeManager } from '../../services/theme-manager/theme-manager';
import { ThemeMode } from '../../models/Theme';

@Component({
  imports: [],
  selector: 'duration-input',
  styleUrl: './duration-input.css',
  templateUrl: './duration-input.html',
})
export class DurationInput {
  themeManager = inject(ThemeManager);

  name = input<string>();
  theme = signal<string>('light');

  private duration = signal<string>('');
  private minutes: number = 0;
  private hours: number = 0;

  ngOnInit() {
    const theme =  this.themeManager.getTheme();
    const themeString = theme === ThemeMode.Dark ? 'dark' : 'light';
    this.theme.set(themeString);

    this.themeManager.subscribe((newTheme) => {
      const newThemeString = newTheme === ThemeMode.Dark ? 'dark' : 'light';
      this.theme.set(newThemeString);
    });
  }


  updateHours(hours: number) {
    this.hours = Number(hours);
    this.calculateDuration();
  }

  updateMinutes(minutes: number) {
    this.minutes = Number(minutes);
    this.calculateDuration();
  }

  calculateDuration() {
    const time = this.hours + (this.minutes / 60.0);
    if (!isFinite(time)) {
      console.error('Invalid duration calculation');
      this.duration.set('0.00');
      return;
    }
    console.log('Calculated duration:', time.toFixed(2));
    this.duration.set(time.toFixed(2));
  }
}
  