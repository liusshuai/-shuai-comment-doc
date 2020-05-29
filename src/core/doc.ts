import fs = require('fs');
import path = require('path');
import Log from '../util/log';
import { isFile, isDir, getExtname, mkDirs, writeFile, fileIsExist, createFileOrDir, deleteFolder, getFileContent } from "../util/file";
import Config, { Output, DemoItem } from '../types/config';
import { File } from '../types/file';
import { pushData } from '../util/parse';
import htmlWrap from '../util/html';
import { parseTitle, parseCode } from '../util/markdown';

export default class Doc {
    start: number;
    end: number;
    plugins: string[];
    output: Output;
    demo: DemoItem[]

    constructor(options: Config) {
        const { plugins = [] } = options;
        this.start = 0;
        this.end = 0;
        this.plugins = plugins;
        this.output = options.output as Output;
        this.demo = options.demo || []
    }

    protected loadPlugins(filePath: string) {
        const extname = getExtname(filePath);
        const plugins = this.plugins;
        plugins.forEach(route => {
            const plugin = require(route);
            if (!plugin.extRegExp) {
                Log.error(['a doc plugin must have the extregexp property.', 
                    '',
                    `error in plugin ${route}`]);
                process.exit(1);
            }
            if (plugin.extRegExp.test(extname)) {
                plugin.init({
                    filePath
                });
            }
        });
    }

    scan(entry: string) {
        this.start = new Date().getTime();
        if (isFile(entry)) {
            this.loadPlugins(entry);
        } else {
            const files: string[] = fs.readdirSync(entry);
            files.forEach((filename) => {
                const filedir = path.join(entry, filename);
    
                isFile(filedir) && this.loadPlugins(filedir);
                isDir(filedir) && this.scan(filedir);
            });
        }
    }

    print(output: string) {
        let files: File[] = [];
        this.plugins.forEach(p => {
            const plugin = require(p);
            files = files.concat(plugin.docs);
        });
        printFile(output, this.output, files);
        printDemoFile(this.demo);
        this.end = new Date().getTime();
    }
}

function printFile(output: string, info: Output, files: File[]) {
    const { markdown, html } = info; 
    if (isDir(output)) {
        const filePaths: string[] = [];
        html && filePaths.push('/html');
        markdown && filePaths.push('/md');

        mkDirs(output, filePaths); // Create storage directory
        files.forEach(file => {
            const { filename, props = [], methods = [] } = file;
            if (props.length || methods.length) {
                const res = pushData(file, html as boolean);
                if (res === null) return;
                html
                    && writeFile(path.join(output, `/html/${filename}.html`), htmlWrap('', res.html));
                markdown
                    && writeFile(path.join(output, `/md/${filename}.md`), res.md);
            }
        });
    } else if (isFile(output)) {
        const extname = getExtname(output);
        const type = extname === '.html' ? 'html' : 'md';
        let contentStr = '';
        files.forEach(file => {
            const { props = [], methods = [] } = file;
            if (props.length || methods.length) {
                const res = pushData(file, html as boolean);
                if (res === null) return;
                contentStr += res[type];
            }
        });

        type === 'html' ?
            writeFile(output, htmlWrap('', contentStr))
            : writeFile(output, contentStr);
    }
}

function printDemoFile(demo: DemoItem[]) {
    if (!demo.length) return;
    demo.forEach(d => {
        const entry = d.entry;
        const output = d.output;
        const entryIsExist: boolean = fileIsExist(entry);
        if (!entryIsExist) {
            Log.error([`${entry} does not exist`]);
            return;
        }
        !fileIsExist(output) && createFileOrDir(output);
        if (isDir(output)) {
            Log.error(['demo output must be file']);
            deleteFolder(output);
            return;
        }

        const demoContent = getFileContent(entry);
        const outputContent = getFileContent(output);

        const demoStr = parseTitle('Example:3')
            + parseCode(demoContent, 'js') + '\n\n';

        const result = outputContent + demoStr;

        writeFile(output, result);
    });
}