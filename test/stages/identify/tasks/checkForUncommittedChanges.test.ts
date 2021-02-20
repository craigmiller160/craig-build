import * as E from 'fp-ts/Either'
import runCommand from '../../../../src/utils/runCommand';
import checkForUncommittedChanges, { TASK_NAME } from '../../../../src/stages/identify/tasks/checkForUncommittedChanges';
import '@relmify/jest-fp-ts';
import BuildError from '../../../../src/error/BuildError';
import stageName from '../../../../src/stages/identify/stageName';

const runCommandMock = runCommand as jest.Mock;

describe('checkForUncommittedChanges', () => {
    it('there are uncommitted changes', async () => {
        runCommandMock.mockImplementation(() => E.right('Hello World'));
        const result = await checkForUncommittedChanges(undefined)();
        expect(result).toEqualLeft(new BuildError(
            'Please commit or revert all changes before running build.',
            stageName,
            TASK_NAME
        ));

        expect(runCommandMock).toHaveBeenCalledWith('git status --porcelain');
    });

    it('there are not uncommitted changes', async () => {
        runCommandMock.mockImplementation(() => E.right(''));
        const result = await checkForUncommittedChanges(undefined)();
        expect(result).toEqualRight(undefined);

        expect(runCommandMock).toHaveBeenCalledWith('git status --porcelain');
    });
});