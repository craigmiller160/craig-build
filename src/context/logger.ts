/* eslint-disable no-console */
import chalk from 'chalk';

const LOG_PREFIX = 'CRAIG-BUILD';

export const SUCCESS_STATUS = 'success';
export const ERROR_STATUS = 'error';
type StatusType = typeof SUCCESS_STATUS | typeof ERROR_STATUS;

const doLog = (message: string, status?: StatusType) => {
    if (SUCCESS_STATUS === status) {
        console.log(chalk.green(message));
    } else if (ERROR_STATUS === status) {
        console.error(chalk.red(message));
    } else {
        console.log(message);
    }
};

export const taskLogger = (taskName: string, message: string, status?: StatusType) => {
    const fullMessage = `[${LOG_PREFIX}] [Task: ${taskName}] ${message}`;
    doLog(fullMessage, status);
};

export const stageLogger = (stageName: string, message: string, status?: StatusType) => {
    const fullMessage = `[${LOG_PREFIX}] [Stage: ${stageName}] ${message}`;
    doLog(fullMessage, status);
};

export const buildLogger = (message: string, status?: StatusType) => {
    const fullMessage = `[${LOG_PREFIX}] [Build] ${message}`;
    doLog(fullMessage, status);
};

// TODO if unused, delete this
// TODO if used, needs another package
