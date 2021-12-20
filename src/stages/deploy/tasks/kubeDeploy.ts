import createTask, { TaskFunction } from '../../../common/execution/task';
import ProjectInfo from '../../../types/ProjectInfo';
import { TaskContext } from '../../../common/execution/context';
import { executeIfApplication } from '../../../common/execution/commonTaskConditions';
import { pipe } from 'fp-ts/function';
import path from 'path';
import getCwd from '../../../utils/getCwd';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import fs from 'fs';
import runCommand from '../../../utils/runCommand';
import stageName from '../stageName';
import handleUnknownError from '../../../utils/handleUnknownError';

export const BASE_DEPLOYMENT_FILE = 'deployment.yml';
export const TEMP_DEPLOYMENT_FILE = 'deployment.temp.yml';

const DEPLOYMENT_IMAGE_REGEX =
	/(?<startWhitespace>\s*)image:\s?craigmiller160.ddns.net:30004\/.*:.*/;

interface DeploymentImageRegexGroups {
	startWhitespace: string;
}

export const TASK_NAME = 'Kubernetes Deployment';

export const APPLY_DEPLOYMENT = 'kubectl apply -f deployment.temp.yml';
export const RESTART_APP_BASE = 'kubectl rollout restart deployment';
export const createApplyConfigmap = (fileName: string) =>
	`kubectl apply -f ${fileName}`;

const applyConfigmap = (
	context: TaskContext<ProjectInfo>
): E.Either<Error, string> => {
	const deployDir = path.resolve(getCwd(), 'deploy');
	const configmapFileNames = (fs.readdirSync(deployDir) || []).filter(
		(fileName) => fileName.endsWith('configmap.yml')
	);
	if (configmapFileNames.length === 0) {
		context.logger('No configmap in project');
		return E.right('');
	}

	return configmapFileNames.reduce<E.Either<Error, string>>(
		(result, fileName) => {
			if (E.isLeft(result)) {
				return result;
			}

			return runCommand(createApplyConfigmap(fileName), {
				cwd: deployDir,
				logOutput: true
			});
		},
		E.right('')
	);
};

const applyDeployment = (): E.Either<Error, string> => {
	const deployDir = path.resolve(getCwd(), 'deploy');
	return runCommand(APPLY_DEPLOYMENT, { cwd: deployDir, logOutput: true });
};

const restartApp = (projectInfo: ProjectInfo): E.Either<Error, string> => {
	const deployDir = path.resolve(getCwd(), 'deploy');
	return runCommand(
		`${RESTART_APP_BASE} ${projectInfo.kubernetesDeploymentName}`,
		{
			cwd: deployDir,
			logOutput: true
		}
	);
};

const clearTempDeploymentFile = (): E.Either<Error, void> =>
	E.tryCatch(() => {
		const tempPath = path.resolve(getCwd(), 'deploy', TEMP_DEPLOYMENT_FILE);
		if (fs.existsSync(tempPath)) {
			fs.rmSync(tempPath);
		}
	}, handleUnknownError);

const createTempDeploymentFile = (): E.Either<Error, void> =>
	E.tryCatch(
		() =>
			fs.copyFileSync(
				path.resolve(getCwd(), 'deploy', BASE_DEPLOYMENT_FILE),
				path.resolve(getCwd(), 'deploy', TEMP_DEPLOYMENT_FILE)
			),
		handleUnknownError
	);

const modifyTempDeployment = (
	context: TaskContext<ProjectInfo>
): E.Either<Error, null> => {
	if (context.input.isPreRelease) {
		const tempFilePath = path.resolve(
			getCwd(),
			'deploy',
			TEMP_DEPLOYMENT_FILE
		);

		return pipe(
			E.tryCatch(
				() => fs.readFileSync(tempFilePath, 'utf8'),
				handleUnknownError
			),
			E.chain((tempDeploymentContent) => {
				if (!DEPLOYMENT_IMAGE_REGEX.test(tempDeploymentContent)) {
					return E.left(
						context.createBuildError(
							'Deployment file does not have valid image section'
						)
					);
				}
				return E.right(tempDeploymentContent);
			}),
			E.chain((tempDeploymentContent) =>
				E.tryCatch(() => {
					const groups = DEPLOYMENT_IMAGE_REGEX.exec(
						tempDeploymentContent
					)?.groups as unknown as DeploymentImageRegexGroups;

					const newContent = tempDeploymentContent.replace(
						/\s*image:\s?craigmiller160.ddns.net:30004\/.*:.*/,
						`${groups.startWhitespace}image: craigmiller160.ddns.net:30004/${context.input.name}:${context.input.dockerPreReleaseVersion}`
					);

					fs.writeFileSync(tempFilePath, newContent);
					return null
				}, handleUnknownError)
			)
		);
	}
	return E.right(null);
};

const kubeDeploy: TaskFunction<ProjectInfo> = (
	context: TaskContext<ProjectInfo>
) =>
	pipe(
		clearTempDeploymentFile(),
		E.chain(createTempDeploymentFile),
		E.map(() => modifyTempDeployment(context)),
		E.chain(() => applyConfigmap(context)),
		E.chain(applyDeployment),
		E.chain(() => restartApp(context.input)),
		TE.fromEither,
		TE.map(() => ({
			message: 'Kubernetes deployment complete',
			value: context.input
		}))
	);

export default createTask(stageName, TASK_NAME, kubeDeploy, [
	executeIfApplication
]);
