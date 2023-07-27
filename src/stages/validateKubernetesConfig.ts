import { BuildContext } from '../context/BuildContext';
import { match, P } from 'ts-pattern';
import { isApplication } from '../context/projectTypeUtils';
import { either } from 'fp-ts';
import { function as func } from 'fp-ts';
import { taskEither } from 'fp-ts';
import { readFile } from '../functions/File';
import path from 'path';
import { getCwd } from '../command/getCwd';
import {
	DOCKER_REPO_PREFIX,
	IMAGE_VERSION_ENV,
	KUBERNETES_DEPLOY_FILE
} from '../configFileTypes/constants';
import { parseYaml } from '../functions/Yaml';
import { KubeDeployment } from '../configFileTypes/KubeDeployment';
import { stringifyJson } from '../functions/Json';
import { predicate } from 'fp-ts';
import { Stage, StageExecuteFn } from './Stage';
import { logger } from '../logger';
import * as EU from '../functions/EitherUtils';

const KUBE_IMAGE_REGEX =
	/^(?<repoPrefix>.*)\/(?<imageName>.*):(?<imageVersion>.*)$/;

export interface KubeValues {
	repoPrefix: string;
	imageName: string;
	imageVersion: string;
}

const evaluateImageRegex = (image?: string): either.Either<Error, KubeValues> =>
	match(image ?? '')
		.with('', () =>
			either.left(new Error('Kubernetes config is missing image'))
		)
		.when(
			(_) => KUBE_IMAGE_REGEX.test(_),
			(_) =>
				either.right(
					KUBE_IMAGE_REGEX.exec(_)?.groups as unknown as KubeValues
				)
		)
		.otherwise(() =>
			either.left(new Error('Kubernetes image does not match pattern'))
		);

const validateKubeValues = (
	context: BuildContext,
	kubeValues: KubeValues
): either.Either<Error, KubeValues> =>
	match(kubeValues)
		.with(
			{
				repoPrefix: DOCKER_REPO_PREFIX,
				imageName: context.projectInfo.name,
				imageVersion: IMAGE_VERSION_ENV
			},
			() => either.right(kubeValues)
		)
		.otherwise(() =>
			either.left(
				new Error(
					`Kubernetes image is invalid: ${EU.getOrThrow(
						stringifyJson(kubeValues, 2)
					)}`
				)
			)
		);

const validateConfig = (
	context: BuildContext,
	kubeDeployment: KubeDeployment
): either.Either<Error, BuildContext> =>
	func.pipe(
		evaluateImageRegex(
			kubeDeployment?.spec?.template?.spec?.containers?.[0]?.image
		),
		either.chain((_) => validateKubeValues(context, _)),
		either.map(() => context)
	);

const readAndValidateConfig = (
	context: BuildContext
): either.Either<Error, BuildContext> => {
	logger.debug(
		`Kubernetes configuration should have image environment variable: ${IMAGE_VERSION_ENV}`
	);
	return func.pipe(
		readFile(path.join(getCwd(), KUBERNETES_DEPLOY_FILE)),
		either.map((_) => _.split('---')[0]),
		either.chain((_) => parseYaml<KubeDeployment>(_)),
		either.chain((_) => validateConfig(context, _))
	);
};

const validateConfigByProject = (
	context: BuildContext
): either.Either<Error, BuildContext> =>
	match(context)
		.with({ projectType: P.when(isApplication) }, readAndValidateConfig)
		.run();

const execute: StageExecuteFn = (context) =>
	func.pipe(validateConfigByProject(context), taskEither.fromEither);
const shouldStageExecute: predicate.Predicate<BuildContext> = (context) =>
	isApplication(context.projectType);

export const validateKubernetesConfig: Stage = {
	name: 'Validate Kubernetes Config',
	execute,
	shouldStageExecute
};
