const LOG_PREFIX = 'CRAIG-BUILD'

export const taskLogger = (taskName: string, message: string) =>
    console.log(`[${LOG_PREFIX}] [Task: ${taskName}] ${message}`);

export const stageLogger = (stageName: string, message: string) =>
    console.log(`[${LOG_PREFIX}] [Stage: ${stageName}] ${message}`);

export const buildLogger = (message: string) =>
    console.log(`[${LOG_PREFIX}] [Build] ${message}`);

// TODO if unused, delete this
// TODO if used, needs another package
