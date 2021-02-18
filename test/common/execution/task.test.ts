import { createTaskLogger, SUCCESS_STATUS } from '../../../src/common/logger';
import { createBuildError } from '../../../src/error/BuildError';
import createTask, { TaskFunction, TaskShouldExecuteFunction } from '../../../src/common/execution/task';
import { TaskContext } from '../../../src/common/execution/context';
import * as TE from 'fp-ts/TaskEither';
import '@relmify/jest-fp-ts';

jest.mock('../../../src/common/logger', () => ({
    ...(jest.requireActual('../../../src/common/logger') as object),
    createTaskLogger: jest.fn()
}));
jest.mock('../../../src/error/BuildError', () => ({
    ...(jest.requireActual('../../../src/error/BuildError') as object),
    createBuildError: jest.fn()
}));

const createTaskLoggerMock = createTaskLogger as jest.Mock;
const createBuildErrorMock = createBuildError as jest.Mock;
const mockLogger = jest.fn();
const stageName = 'StageName';
const taskName = 'TaskName';
const taskFn: TaskFunction<string> = (context: TaskContext<string>) =>
    TE.of({
        message: 'The message',
        value: `${context.input}-result`
    });
const shouldExecute: TaskShouldExecuteFunction<string> = (input: string) => ({
    message: 'Skipping',
    defaultResult: input
});

describe('createTask', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        createTaskLoggerMock.mockImplementation(() => mockLogger);
    });

    it('creates executable task', async () => {
        const executableTask = createTask(stageName, taskName, taskFn);

        expect(mockLogger).not.toHaveBeenCalled();
        expect(executableTask).toEqual(expect.any(Function));

        const result = await executableTask('Hello')();
        expect(result).toEqualRight('Hello-result');

        expect(mockLogger).toHaveBeenCalledTimes(2);
        expect(mockLogger).toHaveBeenNthCalledWith(1, 'Starting...');
        expect(mockLogger).toHaveBeenNthCalledWith(2, 'Finished. The message', SUCCESS_STATUS);
    });

    it('creates task that skips execution', async () => {
        const executableTask = createTask(stageName, taskName, taskFn, shouldExecute);

        expect(mockLogger).not.toHaveBeenCalled();
        expect(executableTask).toEqual(expect.any(Function));

        const result = await executableTask('Hello')();
        expect(result).toEqualRight('Hello');

        expect(mockLogger).toHaveBeenCalledTimes(1);
        expect(mockLogger).toHaveBeenNthCalledWith(1, `Skipping task ${taskName}: Skipping`);
    });
});