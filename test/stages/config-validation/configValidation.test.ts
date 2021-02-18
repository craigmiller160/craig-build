import validateDependencyVersions from '../../../src/stages/config-validation/tasks/validateDependencyVersions';
import validateKubeVersion from '../../../src/stages/config-validation/tasks/validateKubeVersion';
import validateGitTag from '../../../src/stages/config-validation/tasks/validateGitTag';
import validateNexusVersion from '../../../src/common/tasks/validateNexusVersion';
import ProjectInfo from '../../../src/types/ProjectInfo';
import ProjectType from '../../../src/types/ProjectType';
import configValidation from '../../../src/stages/config-validation';
import * as TE from 'fp-ts/TaskEither';
import '@relmify/jest-fp-ts';
import BuildError from '../../../src/error/BuildError';
import stageName from '../../../src/stages/config-validation/stageName';

jest.mock('../../../src/stages/config-validation/tasks/validateDependencyVersions', () => jest.fn());
jest.mock('../../../src/stages/config-validation/tasks/validateKubeVersion', () => jest.fn());
jest.mock('../../../src/stages/config-validation/tasks/validateGitTag', () => jest.fn());
jest.mock('../../../src/common/tasks/validateNexusVersion', () => jest.fn());

const validateDependencyVersionsMock = validateDependencyVersions as jest.Mock;
const validateKubeVersionMock = validateKubeVersion as jest.Mock;
const validateGitTagMock = validateGitTag as jest.Mock;
const validateNexusVersionMock = validateNexusVersion as jest.Mock;

const projectInfo: ProjectInfo = {
    projectType: ProjectType.NpmLibrary,
    name: 'my-project',
    version: '1.0.0',
    dependencies: [],
    isPreRelease: false
};

describe('configValidation stage', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('completes successfully', async () => {
        validateDependencyVersionsMock.mockImplementation(() => TE.right(projectInfo));
        validateKubeVersionMock.mockImplementation(() => TE.right(projectInfo));
        validateGitTagMock.mockImplementation(() => TE.right(projectInfo));
        validateNexusVersionMock.mockImplementation(() => () => TE.right(projectInfo));

        const result = await configValidation(projectInfo)();
        expect(result).toEqualRight(projectInfo);

        expect(validateDependencyVersionsMock).toHaveBeenCalledWith(projectInfo);
        expect(validateKubeVersionMock).toHaveBeenCalledWith(projectInfo);
        expect(validateGitTagMock).toHaveBeenCalledWith(projectInfo);
        expect(validateNexusVersionMock).toHaveBeenCalledWith(stageName);
    });

    it('completes with error', async () => {
        validateDependencyVersionsMock.mockImplementation(() => TE.right(projectInfo));
        validateKubeVersionMock.mockImplementation(() => TE.left(new BuildError('Failing', stageName)));
        validateGitTagMock.mockImplementation(() => TE.right(projectInfo));
        validateNexusVersionMock.mockImplementation(() => TE.right(projectInfo));

        const result = await configValidation(projectInfo)();
        expect(result).toEqualLeft(new BuildError('Failing', stageName));

        expect(validateDependencyVersionsMock).toHaveBeenCalledWith(projectInfo);
        expect(validateKubeVersionMock).toHaveBeenCalledWith(projectInfo);
        expect(validateGitTagMock).not.toHaveBeenCalled();
        expect(validateNexusVersionMock).toHaveBeenCalledWith(stageName);
    });
});
