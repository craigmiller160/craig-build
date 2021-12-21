import '@relmify/jest-fp-ts';
import ProjectInfo from '../../../../old-src/types/ProjectInfo';
import ProjectType from '../../../../old-src/types/ProjectType';
import validateKubeVersion, {
	TASK_NAME
} from '../../../../old-src/stages/config-validation/tasks/validateKubeVersion';
import BuildError from '../../../../old-src/error/BuildError';
import stageName from '../../../../old-src/stages/config-validation/stageName';

describe('validateKubeVersion task', () => {
	it('valid pre-release kubernetes version', async () => {
		const projectInfo: ProjectInfo = {
			projectType: ProjectType.NpmApplication,
			group: 'craigmiller160',
			name: 'my-project',
			version: '1.0.0-beta',
			isPreRelease: true,
			dependencies: [],
			kubernetesDockerImage: 'localhost:30000/my-project:latest'
		};
		const result = await validateKubeVersion(projectInfo)();
		expect(result).toEqualRight(projectInfo);
	});

	it('valid pre-release kubernetes version that says "beta"', async () => {
		const projectInfo: ProjectInfo = {
			projectType: ProjectType.NpmApplication,
			group: 'craigmiller160',
			name: 'my-project',
			version: '1.0.0-beta',
			isPreRelease: true,
			dependencies: [],
			kubernetesDockerImage: 'localhost:30000/my-project:1.0.0-beta'
		};
		const result = await validateKubeVersion(projectInfo)();
		expect(result).toEqualRight(projectInfo);
	});

	it('invalid pre-release kubernetes version', async () => {
		const projectInfo: ProjectInfo = {
			projectType: ProjectType.NpmApplication,
			group: 'craigmiller160',
			name: 'my-project',
			version: '1.0.0-beta',
			isPreRelease: true,
			dependencies: [],
			kubernetesDockerImage: 'localhost:30000/my-project:1.0.0'
		};
		const result = await validateKubeVersion(projectInfo)();
		const message =
			'Invalid Kubernetes Version. Project Version: 1.0.0-beta Kubernetes Image: localhost:30000/my-project:1.0.0';
		expect(result).toEqualLeft(
			new BuildError(message, TASK_NAME, stageName)
		);
	});

	it('valid release kubernetes version', async () => {
		const projectInfo: ProjectInfo = {
			projectType: ProjectType.NpmApplication,
			group: 'craigmiller160',
			name: 'my-project',
			version: '1.0.0',
			isPreRelease: false,
			dependencies: [],
			kubernetesDockerImage: 'localhost:30000/my-project:1.0.0'
		};
		const result = await validateKubeVersion(projectInfo)();
		expect(result).toEqualRight(projectInfo);
	});

	it('invalid release kubernetes version', async () => {
		const projectInfo: ProjectInfo = {
			projectType: ProjectType.NpmApplication,
			group: 'craigmiller160',
			name: 'my-project',
			version: '1.0.0',
			isPreRelease: false,
			dependencies: [],
			kubernetesDockerImage: 'localhost:30000/my-project:1.0.1'
		};
		const result = await validateKubeVersion(projectInfo)();
		const message =
			'Invalid Kubernetes Version. Project Version: 1.0.0 Kubernetes Image: localhost:30000/my-project:1.0.1';
		expect(result).toEqualLeft(
			new BuildError(message, TASK_NAME, stageName)
		);
	});

	describe('skip execution', () => {
		it('is not application', async () => {
			const projectInfo: ProjectInfo = {
				projectType: ProjectType.NpmLibrary,
				group: 'craigmiller160',
				name: 'my-project',
				version: '1.0.0-beta',
				isPreRelease: true,
				dependencies: [],
				kubernetesDockerImage: 'localhost:30000/my-project:1.0.0-beta'
			};
			const result = await validateKubeVersion(projectInfo)();
			expect(result).toEqualRight(projectInfo);
		});
	});
});