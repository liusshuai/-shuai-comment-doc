import Parser, { InitOptions } from '../core/parse';
import { getFileContent } from '../util/file';
import { CommentBlock } from '../types/comment';
import { getDotName } from './common';
import { MethodDoc } from '../types/file';
import { getBlockComments, TabelData, initMethodsDocItem } from '../util/parse';
import ClassDeclaration from '../types/class';

class ClassParser extends Parser {
    readonly extRegExp = /^.(js|jsx)$/;
    init(options: InitOptions) {
        const { filePath, tag } = options;
        this.tag = tag;
        const content = getFileContent(filePath);
        const codeTree = this.parse(filePath, content);
        this.traverseCode(codeTree);
    }

    traverseCode(codeTree: any) {
        const { t, traverse } = super.traverse();
        const _this = this;
        traverse(codeTree, {
            ClassDeclaration(path: any) {
                _this.handle(path.node, codeTree.comments, t);
            }
        });
    }

    handle(node: ClassDeclaration.ClassDeclaration, comments: CommentBlock[], t: any) {
        const dotName: string = getDotName(node.loc.filename);
        const body: ClassDeclaration.ClassBody = node.body;
        let props: any[] = [];
        const exportMethods: MethodDoc[] = [];
        const blockComments = getBlockComments(this.tag, comments);

        for(let i = 0; i < body.body.length; i++) {
            const p = body.body[i];
            if (t.isClassProperty(p)) {
                const prop = p as ClassDeclaration.ClassProperty;
                if (prop.key.name === 'propTypes') {
                    props = reactProps(prop, t);
                }

                if (prop.key.name === 'defaultProps' && props.length) {
                    prop.value && prop.value.properties
                        && prop.value.properties.length
                        && prop.value.properties.forEach(v => {
                            for (let i = 0; i < props.length; i++) {
                                if (props[i].name === v.key.name) {
                                    props[i].value = (v.value as ClassDeclaration.NoExpression).value;
                                }
                            }
                        });
                }
            } else if (t.isClassMethod(p)) {
                const prop = p as ClassDeclaration.ClassMethod;

                const res = initMethodsDocItem(prop, blockComments);
                res && exportMethods.push(res);
            }
        }
        
        this.docs.push({
            filename: dotName,
            props: props,
            methods: exportMethods
        });
    }
}

module.exports = new ClassParser();

interface TabelDataC extends TabelData {
    value: string;
}

function reactProps(node: ClassDeclaration.ClassProperty, t: any): TabelDataC[] {
    const props: TabelDataC[] = [];
    const properties = node.value && (node.value as ClassDeclaration.ClassObjectExp).properties || [];
    properties.forEach(prop => {
        if (t.isObjectProperty(prop)) {
            const p: TabelDataC = {
                name: prop.key?.name || '',
                desc: prop.leadingComments && prop.leadingComments[0] && prop.leadingComments[0].value || '',
                type: '-',
                value: '-'
            };
            if (t.isMemberExpression(prop.value)) {
                p.type = (prop.value as ClassDeclaration.MemberExpression).property.name;
            } else if (t.isCallExpression(prop.value)) {
                const args = (prop.value as ClassDeclaration.CallExpression).arguments;
                const types: string[] = [];
                if (args.length) {
                    const arg = args[0];
                    arg.elements && arg.elements.length
                        && arg.elements.forEach(a => {
                            types.push(a.property.name);
                        });
                }

                p.type = types.join(',');
            }
            props.push(p);
        }
    });

    return props;
}