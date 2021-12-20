import path from 'path';
import getCwd from '../../../../src/utils/getCwd';
import ProjectInfo from '../../../../src/types/ProjectInfo';
import ProjectType from '../../../../src/types/ProjectType';
import kubeDeploy, {
	APPLY_DEPLOYMENT,
	createApplyConfigmap,
	DEPLOYMENT_IMAGE_REGEX,
	DeploymentImageRegexGroups,
	RESTART_APP_BASE,
	TEMP_DEPLOYMENT_FILE
} from '../../../../src/stages/deploy/tasks/kubeDeploy';
import '@relmify/jest-fp-ts';
import runCommand from '../../../../src/utils/runCommand';
import * as E from 'fp-ts/Either';
import { nanoid } from 'nanoid';
import fs from 'fs';

const configmapPath = path.resolve(
	process.cwd(),
	'test',
	'__working-dirs__',
	'npmReleaseApplication'
);
const noConfigmapPath = path.resolve(
	process.cwd(),
	'test',
	'__working-dirs__',
	'mavenReleaseApplication'
);
const noConfigmapPreReleasePath = path.resolve(
	process.cwd(),
	'test',
	'__working-dirs__',
	'dockerBetaApplication2'
);
const multiConfigmapPath = path.resolve(
	process.cwd(),
	'test',
	'__working-dirs__',
	'dockerReleaseApplicationMultiConfigmap'
);

const getCwdMock = getCwd as jest.Mock;
const runCommandMock = runCommand as jest.Mock;

const projectInfo: ProjectInfo = {
	projectType: ProjectType.NpmApplication,
	group: 'craigmiller160',
	name: 'my-project',
	version: '1.0.0',
	dependencies: [],
	isPreRelease: false,
	kubernetesDeploymentName: 'my-project'
};

describe('kubeDeploy task', () => {
	it('deploys with configmap', async () => {
		getCwdMock.mockImplementation(() => configmapPath);
		runCommandMock.mockImplementation(() => E.right(''));

		const result = await kubeDeploy(projectInfo)();
		expect(result).toEqualRight(projectInfo);

		expect(runCommandMock).toHaveBeenCalledTimes(3);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			1,
			createApplyConfigmap('configmap.yml'),
			{
				cwd: path.resolve(configmapPath, 'deploy'),
				logOutput: true
			}
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(2, APPLY_DEPLOYMENT, {
			cwd: path.resolve(configmapPath, 'deploy'),
			logOutput: true
		});
		expect(runCommandMock).toHaveBeenNthCalledWith(
			3,
			`${RESTART_APP_BASE} my-project`,
			{
				cwd: path.resolve(configmapPath, 'deploy'),
				logOutput: true
			}
		);
		expect(
			fs.existsSync(
				path.resolve(configmapPath, 'deploy', TEMP_DEPLOYMENT_FILE)
			)
		).toEqual(true);
	});

	it('deploys for pre-release without configmap', async () => {
		getCwdMock.mockImplementation(() => noConfigmapPreReleasePath);
		runCommandMock.mockImplementation(() => E.right(''));

		const id = nanoid();

		const newProjectInfo = {
			...projectInfo,
			isPreRelease: true,
			dockerPreReleaseVersion: `1.0.0-beta.${id}`
		};

		const result = await kubeDeploy(newProjectInfo)();
		expect(result).toEqualRight(newProjectInfo);

		expect(runCommandMock).toHaveBeenCalledTimes(2);
		expect(runCommandMock).toHaveBeenNthCalledWith(1, APPLY_DEPLOYMENT, {
			cwd: path.resolve(noConfigmapPreReleasePath, 'deploy'),
			logOutput: true
		});
		expect(runCommandMock).toHaveBeenNthCalledWith(
			2,
			`${RESTART_APP_BASE} my-project`,
			{
				cwd: path.resolve(noConfigmapPreReleasePath, 'deploy'),
				logOutput: true
			}
		);
		const deploymentPath = path.resolve(
			noConfigmapPreReleasePath,
			'deploy',
			TEMP_DEPLOYMENT_FILE
		);
		expect(fs.existsSync(deploymentPath)).toEqual(true);
		const deploymentContent = fs.readFileSync(deploymentPath, 'utf8');
		expect(DEPLOYMENT_IMAGE_REGEX.test(deploymentContent)).toEqual(true);
		const groups = DEPLOYMENT_IMAGE_REGEX.exec(deploymentContent)
			?.groups as unknown as DeploymentImageRegexGroups;
		expect(groups.versionNumber).toEqual(
			newProjectInfo.dockerPreReleaseVersion
		);
	});

	it('deploys without configmap', async () => {
		getCwdMock.mockImplementation(() => noConfigmapPath);
		runCommandMock.mockImplementation(() => E.right(''));

		const result = await kubeDeploy(projectInfo)();
		expect(result).toEqualRight(projectInfo);

		expect(runCommandMock).toHaveBeenCalledTimes(2);
		expect(runCommandMock).toHaveBeenNthCalledWith(1, APPLY_DEPLOYMENT, {
			cwd: path.resolve(noConfigmapPath, 'deploy'),
			logOutput: true
		});
		expect(runCommandMock).toHaveBeenNthCalledWith(
			2,
			`${RESTART_APP_BASE} my-project`,
			{
				cwd: path.resolve(noConfigmapPath, 'deploy'),
				logOutput: true
			}
		);
		expect(
			fs.existsSync(
				path.resolve(noConfigmapPath, 'deploy', TEMP_DEPLOYMENT_FILE)
			)
		).toEqual(true);
	});

	it('deploys with multiple configmaps', async () => {
		getCwdMock.mockImplementation(() => multiConfigmapPath);
		runCommandMock.mockImplementation(() => E.right(''));

		const result = await kubeDeploy(projectInfo)();
		expect(result).toEqualRight(projectInfo);

		expect(runCommandMock).toHaveBeenCalledTimes(4);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			1,
			'kubectl apply -f one.configmap.yml',
			{
				cwd: path.resolve(multiConfigmapPath, 'deploy'),
				logOutput: true
			}
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			2,
			'kubectl apply -f two.configmap.yml',
			{
				cwd: path.resolve(multiConfigmapPath, 'deploy'),
				logOutput: true
			}
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(3, APPLY_DEPLOYMENT, {
			cwd: path.resolve(multiConfigmapPath, 'deploy'),
			logOutput: true
		});
		expect(runCommandMock).toHaveBeenNthCalledWith(
			4,
			`${RESTART_APP_BASE} my-project`,
			{
				cwd: path.resolve(multiConfigmapPath, 'deploy'),
				logOutput: true
			}
		);
		expect(
			fs.existsSync(
				path.resolve(multiConfigmapPath, 'deploy', TEMP_DEPLOYMENT_FILE)
			)
		).toEqual(true);
	});

	describe('skip execution', () => {
		it('is library', async () => {
			const newProjectInfo: ProjectInfo = {
				...projectInfo,
				projectType: ProjectType.NpmLibrary
			};
			const result = await kubeDeploy(newProjectInfo)();
			expect(result).toEqualRight(newProjectInfo);

			expect(runCommandMock).not.toHaveBeenCalled();
		});
	});
});
