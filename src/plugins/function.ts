import Parser, { InitOptions } from '../core/parse';
import { getFileContent, dotFileName } from '../util/file';
import { getBlockComments, initMethodsDocItem } from '../util/parse';
import { CommentBlock } from '../types/comment';
import { FunctionNode } from '../types/declaration';
import { File } from '../types/file';
import { getDotName } from './common';

class FunctionParser extends Parser {
    readonly extRegExp = /^.js$/;
    docs: File[] = [];
    init(options: InitOptions) {
        const { filePath, tag } = options;
        this.tag = tag;
        const content = getFileContent(filePath);
        const codeTree = this.parse(filePath, content);
        this.traverseCode(codeTree);
    }
    
    private traverseCode(codeTree: any) {
        const { t, traverse } = super.traverse();
        const _this = this;
        traverse(codeTree, {
            FunctionDeclaration(path: any) {
                _this.handleFunc(path.node, codeTree.comments);
            }
        });
    }

    private handleFunc(node: FunctionNode, comments: CommentBlock[]) {
        const dotName: string = getDotName(node.loc.filename);

        const file: File = {
            filename: dotName,
            props: [],
            methods: []
        };

        const blockComments = getBlockComments(this.tag, comments);
        const methods = initMethodsDocItem(node, blockComments);

        methods && file.methods.push(methods);

        this.docs.push(file);
    }
}

module.exports = new FunctionParser();