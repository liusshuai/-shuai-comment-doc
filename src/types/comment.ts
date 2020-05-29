import { Loc } from "./location";

export interface CommentBlock {
    type: string;
    value: string;
    start: number;
    end: number;
    loc: Loc;
}

export interface CommentParseData {
    name?: string;
    codeExport?: boolean;
    callback?: string;
    desc?: string;
    paramsTabel?: string;
}

export interface PropCommentData {
    name: string;
    type: string;
    desc?: string;
    required?: string;
    options?: string;
    default?: string;
}

export interface CommentLine {
    value: string;
    start: number;
    end: number;
    loc: Loc;
}