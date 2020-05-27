import { Base, Identifier, FunctionNode } from './declaration';
import { CommentBlock, CommentLine } from './comment';

namespace ClassDeclaration {
    export interface MemberExpression extends Base {
        object: Identifier;
        property: Identifier;
    } 
    
    export interface CallExpression extends Base {
        arguments: {
            elements: MemberExpression[]
        }[]
    }
    
    export interface ClassObjectExp extends Base {
        properties: ObjectProperty[];
    }

    export interface NoExpression extends Base {
        value: string;
    }
    
    interface ObjectProperty extends Base {
        key: Identifier;
        value: MemberExpression | CallExpression | NoExpression;
        leadingComments?: (CommentBlock | CommentLine)[];
    }
    
    export interface ClassMethod extends FunctionNode {}
    
    export interface ClassProperty extends Base {
        key: Identifier;
        value: ClassObjectExp;
    }
    
    export interface ClassBody extends Base {
        body: (ClassProperty | ClassMethod)[]
    }
    
    export interface ClassDeclaration extends Base {
        id: Identifier;
        superClass: Identifier;
        body: ClassBody
    }
}

export default ClassDeclaration;