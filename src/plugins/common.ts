import { dotFileName } from "../util/file";

export function getDotName(filePath: string | undefined): string {
    if (!filePath) return '';
    const root = process.cwd();
    const fileName: string | undefined = filePath?.replace(root, '');
    const dotName: string = dotFileName(fileName);
    return dotName;
}