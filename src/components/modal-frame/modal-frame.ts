import { Component, output, inject, signal } from '@angular/core';
import { ThemeManager } from '../../services/theme-manager/theme-manager';
import { ThemeMode } from '../../models/Theme';

@Component({
  imports: [],
  selector: 'modal-frame',
  styleUrl: './modal-frame.css',
  templateUrl: './modal-frame.html',
})
export class ModalFrame {
  private themeManager = inject(ThemeManager);

  clickCaughtEvent = output<void>();
  theme = signal("");

  ngOnInit() {
    const currentTheme = this.themeManager.getTheme();
    const themeString = this.getThemeString(currentTheme);
    this.theme.set(themeString);

    this.themeManager.subscribe((theme) => {
      const themeString = this.getThemeString(theme);
      this.theme.set(themeString);
    });
  }

  getThemeString(theme: ThemeMode): string {
    return theme === ThemeMode.Dark ? 'dark' : 'light';
  }

  private onClickCaught(event: Event) {
    const element = event.target as HTMLElement;
    if (element && element.classList.contains("click-catcher")) {
      this.clickCaughtEvent.emit()
    }
  }
}
