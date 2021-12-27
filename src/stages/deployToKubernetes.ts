import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { match, when } from 'ts-pattern';
import { isApplication } from '../context/projectTypeUtils';
import { pipe } from 'fp-ts/function';
import { listFilesInDir } from '../functions/File';
import path from 'path';
import { getCwd } from '../command/getCwd';
import * as A from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import { runCommand } from '../command/runCommand';
import { ConditionalStage, StageExecuteFn } from './Stage';
import * as P from 'fp-ts/Predicate';

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

const doDeploy = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> => {
	const deployDir = path.join(getCwd(), 'deploy');
	return pipe(
		findConfigmaps(deployDir),
		TE.chain((_) => deployConfigmaps(deployDir, _)),
		TE.chain(() =>
			runCommand(
				`KUBE_IMG_VERSION=${context.projectInfo.version} envsubst < deployment.yml | kubectl apply -f -`,
				{
					printOutput: true,
					cwd: deployDir
				}
			)
		),
		TE.map(() => context)
	);
};

const handleDeployByProject = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	match(context)
		.with({ projectType: when(isApplication) }, doDeploy)
		.run();

const execute: StageExecuteFn<BuildContext> = (context) =>
	handleDeployByProject(context);
const commandAllowsStage: P.Predicate<BuildContext> = () => true;
const projectAllowsStage: P.Predicate<BuildContext> = (context) =>
	isApplication(context.projectType);

export const deployToKubernetes: ConditionalStage = {
	name: 'Deploy to Kubernetes',
	execute,
	commandAllowsStage,
	projectAllowsStage
};
