const path = require('path');
const fs = require('fs');

export function pwdPath(filePath: string, root?: string): string {
    return root ? path.resolve(root, filePath)
        : path.resolve(filePath);
}

export function fileIsExist(filePath: string): boolean {
    return fs.existsSync(filePath);
}

export function isDir(filePath: string): boolean {
    return fs.statSync(filePath).isDirectory();
}

export function isFile(filePath: string): boolean {
    return fs.statSync(filePath).isFile();
}

export function createFileOrDir(filePath: string): void {
    const fullPathList: string[] = filePath.split('/');
    if (fullPathList.length > 1) {
        fullPathList.splice(0, 1);
        const _path: string[] = [];
        fullPathList.forEach(f => {
            _path.push(f);
            if (/\S+\.\S+/.test(_path.join('/'))) {
                fs.writeFileSync(filePath, '', 'utf8');
            } else {
                const __path = _path.join('/');
                !fileIsExist(__path) && fs.mkdirSync(__path);
            }
        });
    }
}

export function getExtname (filePath: string): string {
    return path.extname(filePath);
}

export function getFileContent (filePath: string): string {
    return fs.readFileSync(filePath).toString();
}

export function dotFileName(fileName: string | undefined): string {
    if (!fileName) return '';
    return fileName
        .split('/')
        .splice(1)
        .join('.');
}

export function mkDirs(out: string, paths: string[]): void {
    for (let i in paths) {
        if (!fs.existsSync(out + paths[i])) {
            fs.mkdirSync(out + paths[i], (err: any) => {
                console.log(err.message);
                return;
            });
        }
    }
}

export function deleteFolder(path: string) {
    let files = [];
    if(fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach((file: string) => {
            
            const curPath = path + "/" + file;

            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolder(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

export function writeFile(path: string, content: string) {
    fs.writeFileSync(path, content, 'utf8');
}