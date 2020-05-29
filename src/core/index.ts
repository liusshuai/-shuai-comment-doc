import program = require('commander');
import fs = require('fs');
import Config, { Output } from '../types/config';
import { pwdPath, fileIsExist, isDir, isFile, createFileOrDir } from '../util/file';
import Log from '../util/log';
import Doc from './doc';

export default () => {
    const config: Config = mergeConfig();
    const fileEntry: string = program.args[0] || config.entry;
    const pwdFileEntry: string = pwdPath(fileEntry);
    if (!fileIsExist(pwdFileEntry)) {
        Log.error(['entry does not exist']);
        process.exit(1);
    }
    const fileOutput: string = (config.output as Output).path;
    // create file or dir if fileOutput does't exist. 
    if (!fileIsExist(fileOutput)) {
        createFileOrDir(fileOutput);
    }

    const doc = new Doc(config);
    doc.scan(pwdFileEntry);
    const pwdFileOutput = pwdPath(fileOutput);
    doc.print(pwdFileOutput);

    Log.success(['文档生成成功', `耗时${(doc.end - doc.start) / 1000}s`]);
}

function mergeConfig(): Config {
    const printHtml: boolean = program.html || false;
    const printMarkdown: boolean = program.markdown || true;

    const defaultConfig: Config = {
        entry: './',
        output: {
            path: './doc',
            html: printHtml,
            markdown: printMarkdown
        },
        plugins: ['../plugins/function',
            '../plugins/exportDefault',
            '../plugins/class']
    };
    const outterConfigPath: string = `${process.cwd()}/doc.config.js`;
    if (fs.existsSync(outterConfigPath)) {
        const outterConfig = require(outterConfigPath);
        if (outterConfig.output) {
            if (typeof outterConfig.output === 'string') {
                outterConfig.output = {
                    path: outterConfig.output,
                    html: printHtml,
                    markdown: printMarkdown
                };
            } else {
                if (outterConfig.output.html === undefined
                    || outterConfig.output.html === null) {
                        outterConfig.output.html = false;
                }

                if (outterConfig.output.markdown === undefined
                    || outterConfig.output.markdown === null) {
                    outterConfig.output.markdown = true;
                }
            }
        }
        if (outterConfig.plugins) {
            outterConfig.plugins = defaultConfig.plugins?.concat(outterConfig.plugins);
        }
        return Object.assign({}, defaultConfig, outterConfig);
    } else {
        return defaultConfig;
    }
}