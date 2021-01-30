const LOG_PREFIX = 'CRAIG-BUILD'

const taskLogger = (taskName: string, message: string) =>
    console.log(`[${LOG_PREFIX}] [Task: ${taskName}] ${message}`);

const stageLogger = (stageName: string, message: string) =>
    console.log(`[${LOG_PREFIX}] [Stage: ${stageName}] ${message}`);

const buildLogger = (message: string) =>
    console.log(`[${LOG_PREFIX}] [Build] ${message}`);
