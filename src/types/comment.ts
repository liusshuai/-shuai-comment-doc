import { Loc } from "./location";

export interface CommentBlock {
    type: string;
    value: string;
    start: number;
    end: number;
    loc: Loc;
}

export interface CommentParseData {
    codeExport?: boolean;
    callback?: string;
    desc?: string;
    paramsTabel?: string;
}

export interface CommentLine {
    value: string;
    start: number;
    end: number;
    loc: Loc;
}