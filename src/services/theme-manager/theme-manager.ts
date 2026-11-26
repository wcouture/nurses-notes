import { EventEmitter, Service } from '@angular/core';
import { ThemeMode } from '../../models/Theme';

@Service()
export class ThemeManager {
    private currentTheme: ThemeMode = ThemeMode.Light;
    private readonly localStorageKey: string = 'theme';
    private subscribers: ({ func: (theme: ThemeMode) => void, id: number })[] = [];

    private nextSubscriberId: number = 0;

    public subscribe(callback: (theme: ThemeMode) => void): number {
        const id = this.nextSubscriberId++;
        this.subscribers.push({ func: callback, id });
        return id;
    }

    public unsubscribe(id: number): void {
        this.subscribers = this.subscribers.filter(subscriber => subscriber.id !== id);
    }

    public setTheme(theme: ThemeMode): void {
        this.currentTheme = theme;
        localStorage.setItem(this.localStorageKey, theme.toString());
        this.subscribers.forEach(subscriber => subscriber.func(theme));
    }

    public getTheme(): ThemeMode {
        const storedTheme = localStorage.getItem(this.localStorageKey);
        if (storedTheme === ThemeMode.Dark.toString()) {
            this.currentTheme = ThemeMode.Dark;
        } else {
            this.currentTheme = ThemeMode.Light;
        }
        return this.currentTheme;
    }
}
