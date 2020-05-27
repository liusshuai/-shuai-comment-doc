#!/usr/bin/env node
import program = require('commander');
import updateNotifier = require('update-notifier');
import { cliDesc } from './constant';
import doc from './core';

const pkg = require('../package.json');

const notifier = updateNotifier({
    pkg
});
notifier.notify();

program
    .version(pkg.version, '-v, --version')
    .description('Comment Doc: Automatically scan comments to generate documents')
    .usage(cliDesc)
    .option('-md, --markdown', 'output markdown file', true)
    .option('-ht, --html', 'output html file', false)
    .parse(process.argv);

try {
    doc();
} catch (error) {
    console.log(error.message);
    process.exit(1);
}