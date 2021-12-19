import ProjectInfo from '../../../src/types/ProjectInfo';
import ProjectType from '../../../src/types/ProjectType';
import gitTag from '../../../src/stages/cleanup/tasks/gitTag';
import * as TE from 'fp-ts/TaskEither';
import '@relmify/jest-fp-ts';
import cleanup from '../../../src/stages/cleanup';

jest.mock('../../../src/stages/cleanup/tasks/gitTag', () => jest.fn());

const projectInfo: ProjectInfo = {
	projectType: ProjectType.NpmApplication,
	group: 'craigmiller160',
	name: 'my-project',
	version: '1.0.0',
	dependencies: [],
	isPreRelease: false
};

const gitTagMock = gitTag as jest.Mock;

describe('cleanup stage', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('completes successfully', async () => {
		gitTagMock.mockImplementation(() => TE.right(projectInfo));

		const result = await cleanup(projectInfo)();
		expect(result).toEqualRight(projectInfo);

		expect(gitTagMock).toHaveBeenCalledWith(projectInfo);
	});
});
