import '@relmify/jest-fp-ts';
import getSelfProjectInfo from '../../../src/stages/self-validation/tasks/getSelfProjectInfo';
import ProjectInfo from '../../../src/types/ProjectInfo';
import ProjectType from '../../../src/types/ProjectType';
import * as TE from 'fp-ts/TaskEither';
import getNexusProjectInfo from '../../../src/common/tasks/getNexusProjectInfo';
import validateNexusVersion from '../../../src/common/tasks/validateNexusVersion';
import selfValidation from '../../../src/stages/self-validation';

jest.mock('../../../src/stages/self-validation/tasks/getSelfProjectInfo', () => jest.fn());
jest.mock('../../../src/common/tasks/getNexusProjectInfo', () => jest.fn());
jest.mock('../../../src/common/tasks/validateNexusVersion', () => jest.fn());

const getSelfProjectInfoMock = getSelfProjectInfo as jest.Mock;
const getNexusProjectInfoMock = getNexusProjectInfo as jest.Mock;
const validateNexusVersionMock = validateNexusVersion as jest.Mock;

const projectInfo: ProjectInfo = {
    projectType: ProjectType.NpmApplication,
    name: 'email-service',
    version: '1.2.0',
    dependencies: [],
    isPreRelease: false
};

describe('selfValidation stage', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('completes successfully', async () => {
        getSelfProjectInfoMock.mockImplementation(() => TE.right(projectInfo));
        getNexusProjectInfoMock.mockImplementation(() => TE.right(projectInfo));
        validateNexusVersionMock.mockImplementation(() => TE.right(projectInfo));

        const result = await selfValidation(undefined)();
        expect(result).toEqualRight(undefined);

        expect(getSelfProjectInfoMock).toHaveBeenCalledWith(undefined);
        expect(getNexusProjectInfoMock).toHaveBeenCalledWith(projectInfo);
        expect(validateNexusVersionMock).toHaveBeenCalledWith(projectInfo);
    });
});