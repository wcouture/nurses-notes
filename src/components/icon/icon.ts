import { Component, input, inject, signal } from '@angular/core';
import { IconImage } from '../../models/IconImage';
import { ThemeManager } from '../../services/theme-manager/theme-manager';
import { ThemeStringPipe } from '../../pipes/theme-string-pipe/theme-string-pipe';

@Component({
  imports: [],
  selector: 'icon',
  styleUrl: './icon.css',
  templateUrl: './icon.html',
})
export class Icon {
  iconImage = input<IconImage>();
  size = input<number>(3);
  themeManager = inject(ThemeManager);
  themeClass = signal('');


  ngOnInit() {
    // const theme = this.themeManager.getTheme();
    // const themeClass = new ThemeStringPipe().transform(theme);
    // this.themeClass.set(themeClass);

    // this.themeManager.subscribe((theme) => {
    //   const themeClass = new ThemeStringPipe().transform(theme);
    //   this.themeClass.set(themeClass);
    // });
  }

  get sizeClass() {
    return `is-${this.size()}`;
  }
}
