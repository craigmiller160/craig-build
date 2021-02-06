import runCommand from '../../../../src/utils/runCommand';
import * as E from 'fp-ts/Either';
import validateGitTag, { TASK_NAME } from '../../../../src/stages/config-validation/tasks/validateGitTag';
import ProjectInfo from '../../../../src/types/ProjectInfo';
import ProjectType from '../../../../src/types/ProjectType';
import '@relmify/jest-fp-ts';
import BuildError from '../../../../src/error/BuildError';
import { STAGE_NAME } from '../../../../src/stages/config-validation';

const runCommandMock = runCommand as jest.Mock;
const projectInfo: ProjectInfo = {
    projectType: ProjectType.MavenApplication,
    name: 'my-project',
    version: '1.0.0',
    dependencies: [],
    isPreRelease: false
};

describe('validateGitTag task', () => {
    it('git tag already exists', async () => {
        runCommandMock.mockImplementation(() => E.right('v0.0.1\nv0.1.0\nv1.0.0'));
        const result = await validateGitTag(projectInfo)();
        expect(result).toEqualLeft(new BuildError(
            'Project version git tag already exists',
            STAGE_NAME,
            TASK_NAME
        ));
    });

    it('git tag does not exist', async () => {
        runCommandMock.mockImplementation(() => E.right('v0.0.1\nv0.1.0'));
        const result = await validateGitTag(projectInfo)();
        expect(result).toEqualRight(projectInfo);
    });

    describe('shouldExecute', () => {
        it('is application', () => {
            throw new Error();
        });

        it('is not application', () => {
            throw new Error();
        });
    });
});
