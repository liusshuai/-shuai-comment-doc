const MarkdownIt = require('markdown-it');
import { CommentBlock, CommentParseData } from "../types/comment";
import { FunctionNode } from "../types/declaration";
import { parseTabel, parseTitle, parseCode, parseQuote } from "./markdown";
import { generateCode } from "../core/parse";
import { MethodDoc, File } from "../types/file";

export interface TabelData {
    name: string;
    type: string;
    desc: string;
}

const paramReg = /@param/;
const callbackReg = /@callback/;
const descReg = /@desc/;

export function getBlockComments(tag: string, comments: CommentBlock[]): CommentBlock[] {
    const tagReg = new RegExp(tag);
    const blockComments: CommentBlock[] = [];
    comments.forEach(c => {
        if (c.type === 'CommentBlock'
            && tagReg.test(c.value)) {
                blockComments.push(c);
        }   
    });

    return blockComments;
}

export function initMethodsDocItem(node: FunctionNode,
    blockComments: CommentBlock[]): MethodDoc | null {
    const line: number = node.loc.start.line;
    const index: number = getCommentsBodyLine(line, blockComments);

    if (index === -1) return null;
    
    const comment = blockComments[index];
    const params: string[] = [];
    node.params.forEach(p => {
        params.push(p.name);
    });

    const methodInfo: MethodDoc = {
        name: `${(node.key && node.key.name) || (node.id && node.id.name)}(${params.join(',')})`,
        line: node.loc.start.line
    };
    const info: CommentParseData = parseComment(comment.value);

    if (info.codeExport) {
        node.leadingComments && delete node.leadingComments;
        node.trailingComments && delete node.trailingComments;
        methodInfo.code = generateCode(node);
    }

    return Object.assign({}, methodInfo, info);
} 

export function pushData(options: File, html: boolean): { md: string, html: string } | null {
    const { filename, props, methods } = options;
    if (!props.length && !methods.length) return null;

    let mdStr: string = parseTitle(`file -> ${filename}:1`);

    if (props.length) {
        const tabel = parseTabel(props);
        mdStr += parseTitle('API:3') + tabel;
        mdStr += '\n\n';
    }

    if (methods.length) {
        mdStr += parseTitle('Methods:3');

        methods.forEach(m => {
            mdStr += parseTitle(`${m.name}:4`)
                + parseQuote(`line ${m.line}`)
                + '\n' + m.desc + '\n'
                + parseTitle(`Parameters:5`)
                + m.paramsTabel
                + parseTitle(`Callback:5`)
                + m.callback;
            
            if (m.code) {
                mdStr += '\n' + parseTitle(`Code:5`)
                    + parseCode(m.code, 'js');
            }

            mdStr += '\n\n';
        });
    }

    let htmlStr = '';

    if (html) {
        const MD = new MarkdownIt({
            hrml: true,
            linkify: true,
            typographer: true
        });
    
        htmlStr = MD.render(mdStr);
    }

    return { md: mdStr, html: htmlStr };
}

function getCommentsBodyLine(line: number, blockComments: CommentBlock[]): number {
    let _line: number = -1;
    for (let i = 1; i < 10; i++) { 
        _line = blockComments.findIndex(item => item.loc.end.line + i === line);
        if (_line > -1) { break; }
    }
    return _line;
}

function parseComment(comment: string) {
    const params: TabelData[] = [];
    const data: CommentParseData = {};
    const commentGroup: string[] = comment.split('\n')
        .map(c => c.replace(/(\s|\*)*/g, ''))
        .filter(c => c);
    const args = commentGroup[0].split('-');
    if (args.includes('e')) {
        data.codeExport = true;
    }

    commentGroup.splice(0, 1);
    commentGroup.forEach(c => {
        const cRow = c.split(':');
        if (!cRow[1]) return;
        if (paramReg.test(c)) {
            const [ name, type, desc ] = cRow[1].split('|');
            params.push({ name, type, desc });
        } else if (callbackReg.test(c)) {
            data.callback = cRow[1];
        } else if (descReg.test(c)) {
            data.desc = cRow[1];
        }
    });

    data.paramsTabel = parseTabel(params);

    return data;
}