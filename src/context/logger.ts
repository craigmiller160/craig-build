/* eslint-disable no-console */
import chalk from 'chalk';

const LOG_PREFIX = 'CRAIG-BUILD';

export const SUCCESS_STATUS = 'success';
export const ERROR_STATUS = 'error';
type StatusType = typeof SUCCESS_STATUS | typeof ERROR_STATUS;

export const taskLogger = (taskName: string, message: string) =>
    console.log(`[${LOG_PREFIX}] [Task: ${taskName}] ${message}`);

export const stageLogger = (stageName: string, message: string) =>
    console.log(`[${LOG_PREFIX}] [Stage: ${stageName}] ${message}`);

export const buildLogger = (message: string, status?: StatusType) => {
    const fullMessage = `[${LOG_PREFIX}] [Build] ${message}`;
    if (SUCCESS_STATUS === status) {
        console.log(chalk.green(fullMessage));
    } else if (ERROR_STATUS === status) {
        console.error(chalk.red(fullMessage));
    } else {
        console.log(fullMessage);
    }
}


// TODO if unused, delete this
// TODO if used, needs another package
