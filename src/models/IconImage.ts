export class IconImage {
    public src: string;
    public alt: string;
    
    private constructor(src: string, alt: string) {
        this.src = src;
        this.alt = alt;
    }

    public static readonly delete = new IconImage("delete.png", "Delete");
    public static readonly settings = new IconImage("setting.png", "Settings");
    public static readonly add = new IconImage("plus.png", "Add");
    public static readonly edit = new IconImage("edit.png", "Edit");
    public static readonly view = new IconImage("eye.png", "View");
    public static readonly close = new IconImage("close.png", "Close");
    public static readonly back = new IconImage("back.png", "Back");
    public static readonly next = new IconImage("next.png", "Next");
    public static readonly export = new IconImage("export.png", "Export");
}