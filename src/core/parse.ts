import babylon = require('babylon');
import { getExtname, getFileContent } from '../util/file';
import { File } from '../types/file';
const t = require('babel-types');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

export function generateCode(node: any): string {
    return generate(node).code;
}

export interface InitOptions {
    filePath: string;
    tag: string;
}

class Parser {
    docs: File[];
    tag: string;
    constructor() {
        this.docs = [];
        this.tag = '@sdoc';
    }

    init(options: InitOptions) {}

    parse(filePath: string, codeStr: string) {
        return babylon.parse(codeStr, {
            sourceType: "module",
            sourceFilename: filePath,
            allowReturnOutsideFunction: true,
            allowImportExportEverywhere: true,
            plugins: ['jsx', 'flow', 'doExpressions', 'objectRestSpread', 'decorators',
            'classProperties', 'exportExtensions', 'asyncGenerators', 'functionBind',
            'functionSent', 'dynamicImport'] 
        });
    }

    traverse() {
        return {
            t,
            traverse
        };
    }

    generate(node: any): string {
        return generateCode(node);
    }
}

export default Parser;