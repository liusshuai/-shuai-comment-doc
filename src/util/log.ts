import chalk = require('chalk');

type Color = 'red' | 'green';
class Log {
    private log(msgs: string[], func: Color) {
        console.log(chalk[func]('======================================'));
        console.log();
        msgs.forEach(msg => {
            console.log(chalk[func](`         ${msg}           `));
        });
        console.log();
        console.log(chalk[func]('======================================'));
    }

    public error(msgs: string[]) {
        this.log(msgs, 'red');
    }

    public success(msgs: string[]) {
        this.log(msgs, 'green');
    }
}

export default new Log();