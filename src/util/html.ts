export default function htmlWrap(title: string, content: string): string {
    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <link type="text/css" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/4.0.0/github-markdown.min.css">
            <title>${title || 'sdoc'}</title>
        </head>
        <body>
        <div class="markdown-body">
            ${content}
        </div>
        </body>
    </html>`;
}