/* eslint-disable no-console */
import chalk from 'chalk';

export const LOG_PREFIX = 'CRAIG-BUILD';

export const SUCCESS_STATUS = 'success';
export const ERROR_STATUS = 'error';
export type LogStatus = typeof SUCCESS_STATUS | typeof ERROR_STATUS;

const doLog = (message: string, status?: LogStatus) => {
	if (SUCCESS_STATUS === status) {
		console.log(chalk.green(message));
	} else if (ERROR_STATUS === status) {
		console.error(chalk.red(message));
	} else {
		console.log(message);
	}
};

export const createTaskLogger =
	(stageName: string, taskName: string) =>
	(message: string, status?: LogStatus) => {
		const fullMessage = `[${LOG_PREFIX}] [Stage: ${stageName}] [Task: ${taskName}] ${message}`;
		doLog(fullMessage, status);
	};

export const createStageLogger =
	(stageName: string) => (message: string, status?: LogStatus) => {
		const fullMessage = `[${LOG_PREFIX}] [Stage: ${stageName}] ${message}`;
		doLog(fullMessage, status);
	};

export const buildLogger = (message: string, status?: LogStatus) => {
	const fullMessage = `[${LOG_PREFIX}] [Build] ${message}`;
	doLog(fullMessage, status);
};
