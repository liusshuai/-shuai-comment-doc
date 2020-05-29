const MarkdownIt = require('markdown-it');
import { CommentBlock, CommentParseData, PropCommentData } from "../types/comment";
import { FunctionNode } from "../types/declaration";
import { parseTabel, parseTitle, parseCode, parseQuote } from "./markdown";
import { MethodDoc, File } from "../types/file";

export interface TabelData {
    name: string;
    type: string;
    desc: string;
}

const paramReg = /@param/;
const callbackReg = /@return/;
const typeReg = /{(.*?)}/;
const propReg = /^@(type|required|default|options)/;

export function getBlockComments(comments: CommentBlock[]): CommentBlock[] {
    const tagReg = /^\*/;
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

    /** 暴露模块的逻辑，已废弃 */
    // if (info.codeExport) {
    //     node.leadingComments && delete node.leadingComments;
    //     node.trailingComments && delete node.trailingComments;
    //     methodInfo.code = generateCode(node);
    // }

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
                + '\n' + m.desc + '\n';

            if (m.paramsTabel) {
                mdStr += parseTitle(`Parameters:5`)
                    + m.paramsTabel + '\n';
            }

            if (m.callback) {
                mdStr += parseTitle(`Return:5`)
                    + m.callback;
            }
            
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

export function parsePropComment(comment: string) {
    const props: PropCommentData = {name: '', type: '-'};
    const commentGroup: string[] = filterComment(comment);
    // console.log(commentGroup);
    commentGroup.forEach(c => {
        const matched = c.match(propReg);
        if (!matched) { props.desc = c; }
        if (matched && matched[1]) {
            switch(matched[1]) {
                case 'required': 
                    props.required = 'true';
                    break;
                case 'type':
                case 'default': 
                case 'options':
                    const v = c.replace(propReg, '');
                    if (matched[1] === 'type') {
                        const type = parseBrackets(c);
                        if (type !== null) { props.type = type };
                    } else {
                        props[matched[1]] = v.trim();
                    }
                    break;
                default: 
                    break;
            }
        } 
    });

    return props;
}

function getCommentsBodyLine(line: number, blockComments: CommentBlock[]): number {
    let _line: number = -1;
    for (let i = 1; i < 2; i++) { 
        _line = blockComments.findIndex(item => item.loc.end.line + i === line);
        if (_line > -1) { break; }
    }
    return _line;
}

function parseComment(comment: string) {
    const params: TabelData[] = [];
    const data: CommentParseData = { desc: '' };
    const commentGroup: string[] = filterComment(comment);
    
    /** 暴露模块的逻辑，已废弃 */
    // const args = commentGroup[0].split('-');
    // if (args.includes('e')) {
    //     data.codeExport = true;
    //     commentGroup.splice(0, 1);
    // }

    commentGroup.forEach(c => {
        const typeArr = c.match(typeReg);
        let type = '-';
        if (typeArr && typeArr[1]) { type = typeArr[1]; }
        c = c.replace(typeReg, '');
        const cRow = c.split(' ').filter(c => c);
        cRow.splice(0, 1);
        if (paramReg.test(c)) {
            const [name, desc = '-'] = cRow;
            params.push({
                name,
                type,
                desc
            });
        } else if (callbackReg.test(c)) {
            data.callback = type + ', ' + cRow.join(',');
        } else {
            data.desc += c + '\n';
        }
    });

    data.paramsTabel = parseTabel(params);

    return data;
}

function filterComment(comment: string): string[] {
    return comment.split('\n')
    .map(c => c.replace(/(\*)*/g, '').trim())
    .filter(c => c);
}

function parseBrackets(comment: string): string | null {
    const typeArr = comment.match(typeReg);
    if (typeArr && typeArr[1]) { 
        return typeArr[1];
    } else {
        return null;
    }
}