import { Service } from '@angular/core';
import { ThemeMode } from '../../models/Theme';

@Service()
export class ThemeManager {
    private currentTheme: ThemeMode = ThemeMode.Light;

    public setTheme(theme: ThemeMode): void {
        this.currentTheme = theme;
    }

    public getTheme(): ThemeMode {
        return this.currentTheme;
    }
}
