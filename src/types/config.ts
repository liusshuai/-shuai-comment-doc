export interface Output {
    path: string;
    html?: boolean;
    markdown?: boolean;
}

export interface DemoItem {
    entry: string;
    output: string;
}

export default interface Config {
    entry: string;
    output: string | Output;
    demo?: DemoItem[];
    plugins?: string[];
    tag?: string; // delete
}