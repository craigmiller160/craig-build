import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { match, P } from 'ts-pattern';
import { isApplication } from '../context/projectTypeUtils';
import { pipe } from 'fp-ts/function';
import { listFilesInDir, readFile } from '../functions/File';
import path from 'path';
import { getCwd } from '../command/getCwd';
import * as A from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import { runCommand } from '../command/runCommand';
import * as Pred from 'fp-ts/Predicate';
import { Stage, StageExecuteFn } from './Stage';
import { parseYaml } from '../functions/Yaml';
import { KubeDeployment } from '../configFileTypes/KubeDeployment';

const findConfigmaps = (deployDir: string): TE.TaskEither<Error, string[]> =>
	pipe(
		listFilesInDir(deployDir),
		E.map(A.filter((_) => _.endsWith('configmap.yml'))),
		TE.fromEither
	);

const deployConfigmaps = (
	deployDir: string,
	configmapFiles: string[]
): TE.TaskEither<Error, string> =>
	pipe(
		configmapFiles,
		A.reduce(TE.right<Error, string>(''), (result, file) =>
			pipe(
				result,
				TE.chain(() =>
					runCommand(`kubectl apply -f ${file}`, {
						printOutput: true,
						cwd: deployDir
					})
				)
			)
		)
	);

const getDeploymentName = (deployDir: string): E.Either<Error, string> =>
	pipe(
		readFile(path.join(deployDir, 'deployment.yml')),
		E.map((_) => _.split('---')[0]),
		E.chain((_) => parseYaml<KubeDeployment>(_)),
		E.map((_) => _.metadata.name)
	);

/*
 * TODO steps needed for refactor
 *
 * 1) Get deployment name from values.yml file appName property
 * 2) Construct imageName property using repo prefix, plus image tag from docker build or other previous stage
 * 3) Run helm command
 * 4) Run restart command
 * 5) Run command to wait on deployment
 */

const doDeploy = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> => {
	const deployDir = path.join(getCwd(), 'deploy');
	return pipe(
		getDeploymentName(deployDir),
		TE.fromEither,
		TE.bindTo('deploymentName'),
		TE.bind('configmaps', () => findConfigmaps(deployDir)),
		TE.chainFirst(({ configmaps }) =>
			deployConfigmaps(deployDir, configmaps)
		),
		TE.chainFirst(() =>
			runCommand(
				`KUBE_IMG_VERSION=${context.projectInfo.version} envsubst < deployment.yml | kubectl apply -f -`,
				{
					printOutput: true,
					cwd: deployDir
				}
			)
		),
		TE.chainFirst(({ deploymentName }) =>
			runCommand(`kubectl rollout restart deployment ${deploymentName}`, {
				printOutput: true,
				cwd: deployDir
			})
		),
		TE.map(() => context)
	);
};

const handleDeployByProject = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	match(context)
		.with({ projectType: P.when(isApplication) }, doDeploy)
		.run();

const execute: StageExecuteFn = (context) => handleDeployByProject(context);
const shouldStageExecute: Pred.Predicate<BuildContext> = (_: BuildContext) =>
	isApplication(_.projectType);

export const deployToKubernetes: Stage = {
	name: 'Deploy to Kubernetes',
	execute,
	shouldStageExecute
};
