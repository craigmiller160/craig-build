import { Stage, StageFunction } from './Stage';
import { BuildContext } from '../context/BuildContext';
import { __, match, when } from 'ts-pattern';
import { isApplication } from '../context/projectTypeUtils';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { readFile } from '../functions/readFile';
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

const KUBE_IMAGE_REGEX =
	/^(?<repoPrefix>.*:\d*)\/(?<imageName>.*):(?<imageVersion>.*)$/;

export interface KubeValues {
	repoPrefix: string;
	imageName: string;
	imageVersion: string;
}

const evaluateImageRegex = (image?: string): E.Either<Error, KubeValues> =>
	match(image ?? '')
		.with('', () => E.left(new Error('Kubernetes config is missing image')))
		.with(
			when<string>((_) => KUBE_IMAGE_REGEX.test(_)),
			(_) =>
				E.right(
					KUBE_IMAGE_REGEX.exec(_)?.groups as unknown as KubeValues
				)
		)
		.otherwise(() =>
			E.left(new Error('Kubernetes image does not match pattern'))
		);

const validateKubeValues = (
	context: BuildContext,
	kubeValues: KubeValues
): E.Either<Error, KubeValues> =>
	match(kubeValues)
		.with(
			{
				repoPrefix: DOCKER_REPO_PREFIX,
				imageName: context.projectInfo.name,
				imageVersion: IMAGE_VERSION_ENV
			},
			() => E.right(kubeValues)
		)
		.otherwise(() =>
			E.left(
				new Error(
					`Kubernetes image is invalid: ${stringifyJson(
						kubeValues,
						2
					)}`
				)
			)
		);

const validateConfig = (
	context: BuildContext,
	kubeDeployment: KubeDeployment
): E.Either<Error, BuildContext> =>
	pipe(
		evaluateImageRegex(
			kubeDeployment?.spec?.template?.spec?.containers?.[0]?.image
		),
		E.chain((_) => validateKubeValues(context, _)),
		E.map(() => context)
	);

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
