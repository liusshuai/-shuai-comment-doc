import Parser, { InitOptions } from '../core/parse';
import { getFileContent, dotFileName } from '../util/file';
import { CommentBlock } from '../types/comment';
import { ExportDefaultObjectNode, ObjectProperty,
    ObjectExp, Identifier,
    FunctionNode, StringLiteral } from '../types/declaration';
import { MethodDoc } from '../types/file';
import { getBlockComments, TabelData, initMethodsDocItem } from '../util/parse';
import { getDotName } from './common';

class ExportDefaultParser extends Parser {
    readonly extRegExp = /^.vue$/;
    init(options: InitOptions) {
        const { filePath, tag } = options;
        this.tag = tag;
        const content = getFileContent(filePath);
        const jsContent = parseVue(content);
        const codeTree = this.parse(filePath, jsContent);
        this.traverseCode(codeTree);
    }

    private traverseCode(codeTree: any) {
        const { t, traverse } = super.traverse();
        const _this = this;
        traverse(codeTree, {
            ExportDefaultDeclaration(path: any) {
                t.isObjectExpression(path.node.declaration)
                    &&  _this.handle(path.node.declaration, codeTree.comments, t);
            }
        });
    }

    private handle(node: ExportDefaultObjectNode, comments: CommentBlock[], t: any) {
        const properties: (ObjectProperty | FunctionNode)[] = node.properties || [];
        const blockComments = getBlockComments(this.tag, comments);
        const dotName: string = getDotName(node.loc.filename);
        let propTabel: any[] = [];
        let methodTabel: MethodDoc[] = [];
        properties.forEach(p => {
            if (t.isObjectProperty(p)) {
                const prop = p as ObjectProperty;
                const value = prop.value as ObjectExp;
                // 处理props
                if (prop.key.name === 'props'){
                    propTabel = parseProps(value.properties as ObjectProperty[]);
                }

                if (prop.key.name === 'methods') {
                    const properties = (prop.value as ObjectExp).properties || [];
                    if (properties && properties.length) {
                        properties.forEach(_p => {
                            const res = initMethodsDocItem(_p as FunctionNode, blockComments);
                            res && methodTabel.push(res);
                        });
                    }
                }
            }

            if (t.isObjectMethod(p)) {
                const res = initMethodsDocItem(p as FunctionNode, blockComments);
                res && methodTabel.push(res);
            }
        });

        this.docs.push({
            filename: dotName,
            props: propTabel,
            methods: methodTabel
        });
    }
}

module.exports = new ExportDefaultParser();

function parseVue(codeStr: string): string {
    const start = codeStr.indexOf('<script>');
    const end = codeStr.lastIndexOf('</script>');
    if (start < 0 || end < 0) {
        return ''
    }

    return codeStr.substring(start + 8, end);
}

interface TabelDataV extends TabelData {
    required: string;
    value: string;
}

function parseProps (properties: ObjectProperty[]): TabelDataV[] {
    let propTabel: TabelDataV[] = [];
    properties.forEach(prop => {
        const pti: TabelDataV = {
            name: prop.key.name,
            desc: prop.leadingComments && prop.leadingComments[0] && prop.leadingComments[0].value || '-',
            value: '-',
            required: 'false',
            type: '-'
        };

        if ((prop.value as StringLiteral).value) {
            pti.value = (prop.value as StringLiteral).value;
        }

        if ((prop.value as ObjectExp).properties) {
            const p = (prop.value as ObjectExp).properties || [];
            p.forEach(_p => {
                if (_p.key?.name === 'type' || _p.key?.name === 'required') {
                    const _pAsPro = _p as ObjectProperty;
                    if (_p.key?.name === 'type') {
                        const v = _pAsPro.value as Identifier;
                        if (v.name) {
                            pti.type = v.name;
                        }
                    }

                    if (_p.key?.name === 'required') {
                        const v = _pAsPro.value as StringLiteral;
                        if (v.value) {
                            pti.required = v.value;
                        }
                    }
                } else if (_p.key?.name === 'default' && !_p.method) {
                    const _pAsPro = _p as ObjectProperty;
                    if ((_pAsPro.value as StringLiteral).value) {
                        pti.value = (_pAsPro.value as StringLiteral).value;
                    }
                }
            });
        }

        propTabel.push(pti);
    });

    return propTabel;
}