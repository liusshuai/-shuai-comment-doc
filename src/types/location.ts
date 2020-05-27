interface LocItem {
    line: number;
    column: number;
}

export interface Loc {
    start: LocItem;
    end: LocItem;
    filename?: string;
}