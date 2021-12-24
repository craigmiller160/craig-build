import { Stage, StageFunction } from './Stage';
import { BuildContext } from '../context/BuildContext';
import { match, when } from 'ts-pattern';
import { isApplication } from '../context/projectTypeUtils';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { readFile } from '../functions/readFile';
import path from 'path';
import { getCwd } from '../command/getCwd';
import { KUBERNETES_DEPLOY_FILE } from '../configFileTypes/constants';
import { parseYaml } from '../functions/Yaml';
import KubeDeployment from '../configFileTypes/KubeDeployment';

const validateConfig = (
	context: BuildContext,
	kubeDeployment: KubeDeployment
): E.Either<Error, BuildContext> => {
	throw new Error();
};

const readAndValidateConfig = (
	context: BuildContext
): E.Either<Error, BuildContext> =>
	pipe(
		readFile(path.resolve(getCwd(), KUBERNETES_DEPLOY_FILE)),
		E.chain((_) => parseYaml<KubeDeployment>(_)),
		E.chain((_) => validateConfig(context, _))
	);

const validateConfigByProject = (
	context: BuildContext
): E.Either<Error, BuildContext> =>
	match(context)
		.with({ projectType: when(isApplication) }, readAndValidateConfig)
		.otherwise(E.right);

const execute: StageFunction = (context) =>
	pipe(validateConfigByProject(context), TE.fromEither);

export const validateKubernetesConfig: Stage = {
	name: 'Validate Kubernetes Config',
	execute
};
