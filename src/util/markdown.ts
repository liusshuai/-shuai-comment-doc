export function parseCode(code: string, type: string): string {
    return '\n```' + type + '\n'
        + code + '\n```\n';  
}

export function parseQuote(code: string): string {
    return '> ' + code + '\n';
}

export function parseTabel(tabelInfo: any[]): string {
    if (tabelInfo.length <= 0) return '';
    const ths: string[] = [];
    const sep: string[] = [];
    let tr: string = '';
    for (let key in tabelInfo[0]) {
        ths.push(key);
        sep.push('---')
    }

    const th = ths.join('|') + '\n' + sep.join('|') + '\n';

    tabelInfo.forEach(t => {
        const trs = [];
        for (let key in t) {
            trs.push(t[key]);
        }
        tr += trs.join(' | ') + '\n';
    });

    return th + tr;
}

export function parseTitle(hstr: string): string {
    if (!hstr) return '';
    const _h = hstr.split(':');
    const rank = parseInt(_h[1]);
    const tank: string = '#';

    return tank.repeat(rank) + ' ' + _h[0] + '\n';
}