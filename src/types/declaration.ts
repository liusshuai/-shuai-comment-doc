import { Loc } from './location';
import { CommentBlock, CommentLine } from './comment';

interface IdentifierLoc extends Loc {
    identifierName: string;
}

export interface Base {
    start: number;
    end: number;
    loc: Loc;
}

export interface Identifier extends Base {
    loc: IdentifierLoc;
    name: string;
}

export interface FunctionNode extends Base {
    id?: Identifier;
    key?: Identifier;
    async: boolean;
    params: Identifier[];
    leadingComments?: CommentBlock[];
    trailingComments?: CommentBlock[];
    method?: boolean;
}

export interface ObjectExp extends Base {
    properties: (ObjectProperty | FunctionNode)[];
}

export interface StringLiteral extends Base {
    value: string;
    leadingComments?: (CommentBlock | CommentLine)[];
}

export interface ObjectProperty extends Base {
    key: Identifier;
    value: StringLiteral | ObjectExp | Identifier;
    method?: boolean;
    leadingComments?: (CommentBlock | CommentLine)[];
}

export interface ExportDefaultObjectNode extends ObjectExp {}
