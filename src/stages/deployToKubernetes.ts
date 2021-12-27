import { Stage, StageFunction } from './Stage';
import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { match, when } from 'ts-pattern';
import { logger } from '../logger';
import { isApplication } from '../context/projectTypeUtils';
import { flow, pipe } from 'fp-ts/function';
import { listFilesInDir } from '../functions/File';
import path from 'path';
import { getCwd } from '../command/getCwd';
import * as A from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import { runCommand } from '../command/runCommand';

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
	pipe(
		findConfigmaps(deployDir),
		TE.chain((_) => deployConfigmaps(deployDir, _))
	);

	throw new Error();
};

const handleDeployByProject = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	match(context)
		.with({ projectType: when(isApplication) }, doDeploy)
		.otherwise(() => {
			logger.debug('Skipping stage');
			return TE.right(context);
		});

const execute: StageFunction = (context) => handleDeployByProject(context);

export const deployToKubernetes: Stage = {
	name: 'Deploy to Kubernetes',
	execute
};
