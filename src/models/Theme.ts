export class Theme {
    constructor(public name: string,
                public primaryColor: string,
                public secondaryColor: string,
                public primaryTextColor: string,
                public secondaryTextColor: string,
            ) {}
};

export enum ThemeMode {
    Light = 0,
    Dark = 1
}