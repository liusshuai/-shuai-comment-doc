import fs = require('fs');
import path = require('path');
import Log from '../util/log';
import { isFile, isDir, getExtname, mkDirs, writeFile } from "../util/file";
import Config, { Output } from '../types/config';
import { File } from '../types/file';
import { pushData } from '../util/parse';
import htmlWrap from '../util/html';

export default class Doc {
    start: number;
    end: number;
    plugins: string[];
    output: Output;

    constructor(options: Config) {
        const { plugins = [], tag = '@sdoc' } = options;
        this.start = 0;
        this.end = 0;
        this.plugins = plugins;
        this.output = options.output as Output;
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