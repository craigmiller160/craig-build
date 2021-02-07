import { createStageLogger, SUCCESS_STATUS } from '../../../src/common/logger';
import { createBuildError } from '../../../src/error/BuildError';
import createStage, { StageFunction } from '../../../src/common/execution/stage';
import { StageContext } from '../../../src/common/execution/context';
import * as TE from 'fp-ts/TaskEither';
import '@relmify/jest-fp-ts';

jest.mock('../../../src/common/logger', () => ({
    ...(jest.requireActual('../../../src/common/logger') as object),
    createStageLogger: jest.fn()
}));
jest.mock('../../../src/error/BuildError', () => ({
    ...(jest.requireActual('../../../src/error/BuildError') as object),
    createBuildError: jest.fn()
}));

const createStageLoggerMock = createStageLogger as jest.Mock;
const createBuildErrorMock = createBuildError as jest.Mock;
const mockLogger = jest.fn();
const stageName = 'StageName';
const stageFn: StageFunction<string> = (context: StageContext<string>) =>
    TE.of({
        message: 'The message',
        value: `${context.input}-result`
    });

describe('createStage', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        createStageLoggerMock.mockImplementation(() => mockLogger);
    });

    it('creates executable stage', async () => {
        const executableStage = createStage(stageName, stageFn);

        expect(mockLogger).not.toHaveBeenCalled();
        expect(executableStage).toEqual(expect.any(Function));

        const result = await executableStage('Hello')();
        expect(result).toEqualRight('Hello-result');

        expect(createStageLoggerMock).toHaveBeenCalledWith(stageName);
        expect(createBuildErrorMock).toHaveBeenCalledWith(stageName);

        expect(mockLogger).toHaveBeenCalledTimes(2);
        expect(mockLogger).toHaveBeenNthCalledWith(1, 'Starting...');
        expect(mockLogger).toHaveBeenNthCalledWith(2, 'Finished. The message', SUCCESS_STATUS);
    });
});