import '@relmify/jest-fp-ts';
import getSelfProjectInfo from '../../../old-src/stages/self-validation/tasks/getSelfProjectInfo';
import ProjectInfo from '../../../old-src/types/ProjectInfo';
import ProjectType from '../../../old-src/types/ProjectType';
import * as TE from 'fp-ts/TaskEither';
import getNexusProjectInfo from '../../../old-src/common/tasks/getNexusProjectInfo';
import validateNexusVersion from '../../../old-src/common/tasks/validateNexusVersion';
import selfValidation from '../../../old-src/stages/self-validation';
import stageName from '../../../old-src/stages/self-validation/stageName';

jest.mock('../../../src/stages/self-validation/tasks/getSelfProjectInfo', () =>
	jest.fn()
);
jest.mock('../../../src/common/tasks/getNexusProjectInfo', () => jest.fn());
jest.mock('../../../src/common/tasks/validateNexusVersion', () => jest.fn());

const getSelfProjectInfoMock = getSelfProjectInfo as jest.Mock;
const getNexusProjectInfoMock = getNexusProjectInfo as jest.Mock;
const validateNexusVersionMock = validateNexusVersion as jest.Mock;

const projectInfo: ProjectInfo = {
	projectType: ProjectType.NpmApplication,
	group: 'craigmiller160',
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
		getNexusProjectInfoMock.mockImplementation(
			() => () => TE.right(projectInfo)
		);
		validateNexusVersionMock.mockImplementation(
			() => () => TE.right(projectInfo)
		);

		const result = await selfValidation(undefined)();
		expect(result).toEqualRight(undefined);

		expect(getSelfProjectInfoMock).toHaveBeenCalledWith(undefined);
		expect(getNexusProjectInfoMock).toHaveBeenCalledWith(stageName);
		expect(validateNexusVersionMock).toHaveBeenCalledWith(stageName);
	});
});
