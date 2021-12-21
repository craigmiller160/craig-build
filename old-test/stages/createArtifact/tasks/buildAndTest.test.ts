import runCommand from '../../../../old-src/utils/runCommand';
import ProjectInfo from '../../../../old-src/types/ProjectInfo';
import ProjectType from '../../../../old-src/types/ProjectType';
import buildAndTest, {
	MAVEN_BUILD_CMD,
	NPM_BUILD_CMD
} from '../../../../old-src/stages/createArtifact/tasks/buildAndTest';
import '@relmify/jest-fp-ts';
import * as TE from 'fp-ts/TaskEither';
import { isMaven } from '../../../../old-src/utils/projectTypeUtils';

const runCommandMock = runCommand as jest.Mock;

const createProjectInfo = (projectType: ProjectType): ProjectInfo => ({
	projectType,
	group: isMaven(projectType) ? 'io.craigmiller160' : 'craigmiller160',
	name: 'my-project',
	version: '1.0.0',
	dependencies: [],
	isPreRelease: false
});

describe('buildAndTest task', () => {
	beforeEach(() => {
		runCommandMock.mockImplementation(() => TE.of(''));
	});

	it('runs NPM build', async () => {
		const projectInfo = createProjectInfo(ProjectType.NpmLibrary);
		const result = await buildAndTest(projectInfo)();
		expect(result).toEqualRight(projectInfo);

		expect(runCommandMock).toHaveBeenCalledWith(NPM_BUILD_CMD, {
			logOutput: true
		});
	});

	it('runs Maven build', async () => {
		const projectInfo = createProjectInfo(ProjectType.MavenLibrary);
		const result = await buildAndTest(projectInfo)();
		expect(result).toEqualRight(projectInfo);

		expect(runCommandMock).toHaveBeenCalledWith(MAVEN_BUILD_CMD, {
			logOutput: true
		});
	});

	describe('skip execution', () => {
		it('is docker project', async () => {
			const projectInfo = createProjectInfo(
				ProjectType.DockerApplication
			);
			const result = await buildAndTest(projectInfo)();
			expect(result).toEqualRight(projectInfo);

			expect(runCommandMock).not.toHaveBeenCalled();
		});
	});
});
