import { CommentParseData } from "./comment";

export interface MethodDoc extends CommentParseData {
    name: string;
    line: number;
    code?: string;
}

export interface File {
    filename: string;
    props: any[];
    methods: MethodDoc[];
}