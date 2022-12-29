import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { match, P } from 'ts-pattern';
import { isApplication, isHelm } from '../context/projectTypeUtils';
import { flow, pipe } from 'fp-ts/function';
import { readFile } from '../functions/File';
import path from 'path';
import { getCwd } from '../command/getCwd';
import * as E from 'fp-ts/Either';
import { runCommand } from '../command/runCommand';
import * as Pred from 'fp-ts/Predicate';
import { Stage, StageExecuteFn } from './Stage';
import { parseYaml } from '../functions/Yaml';
import { DeploymentValues } from '../configFileTypes/DeploymentValues';
import { createDockerImageTag } from '../utils/dockerUtils';
import { getAndCacheHelmProject } from '../projectCache';
import * as RArray from 'fp-ts/ReadonlyArray';
import * as Monoid from 'fp-ts/Monoid';
import shellEnv from 'shell-env';

const setValuesMonoid: Monoid.Monoid<string> = {
	empty: '',
	concat: (a, b) => {
		if (!a) {
			return b;
		}
		return `${a} ${b}`;
	}
};

export const K8S_CTX = 'microk8s';
export const K8S_NS = 'apps-prod';

const getDeploymentName = (deployDir: string): E.Either<Error, string> =>
	pipe(
		readFile(path.join(deployDir, 'chart', 'values.yml')),
		E.chain((_) => parseYaml<DeploymentValues>(_)),
		E.map((_) => _['app-deployment'].appName)
	);

const isProjectInstalled =
	(projectName: string) =>
	(text: string): boolean =>
		!!text
			.split('\n')
			.map((_) => _.trim())
			.filter((_) => _.length > 0)
			.map((row) => row.split(/\s/).map((_) => _.trim())[0])
			.find((name) => name === projectName);

const getHelmInstallOrUpgrade = (
	projectName: string,
	namespace: string
): TE.TaskEither<Error, string> =>
	pipe(
		runCommand(
			`helm list --kube-context=${K8S_CTX} --namespace ${namespace}`,
			{
				printOutput: true
			}
		),
		TE.map(isProjectInstalled(projectName)),
		TE.map((isInstalled) => (isInstalled ? 'upgrade' : 'install'))
	);

const getNamespace = (context: BuildContext): E.Either<Error, string> => {
	if (!isHelm(context.projectType)) {
		return E.right(K8S_NS);
	}

	return pipe(
		getAndCacheHelmProject(),
		E.map((_) => _.namespace)
	);
};

const createHelmSetValues = (
	context: BuildContext
): E.Either<Error, string> => {
	if (!isHelm(context.projectType)) {
		const image = createDockerImageTag(context.projectInfo);
		return E.right(`--set app-deployment.image=${image}`);
	}

	return pipe(
		getAndCacheHelmProject(),
		E.map((_) => _.setValues ?? {}),
		E.map(
			flow(
				Object.entries,
				RArray.map(([key, value]) => `--set ${key}=${value}`),
				Monoid.concatAll(setValuesMonoid)
			)
		)
	);
};

const createFullHelmCommand = (
	appName: string,
	helmCommand: string,
	tarName: string,
	setValues: string,
	namespace: string
): string =>
	`helm ${helmCommand} ${appName} ${tarName} --kube-context=${K8S_CTX} --namespace ${namespace} --values ./chart/values.yml ${setValues}`;

const doDeploy = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> => {
	const deployDir = path.join(getCwd(), 'deploy');
	const shellVariables = shellEnv.sync();
	const tarFile = path.join(
		deployDir,
		`${context.projectInfo.name}-${context.projectInfo.version}.tgz`
	);
	const deployTE = pipe(
		getNamespace(context),
		E.bindTo('namespace'),
		E.bind('setValues', () => createHelmSetValues(context)),
		TE.fromEither,
		TE.bind('helmCommand', ({ namespace }) =>
			getHelmInstallOrUpgrade(context.projectInfo.name, namespace)
		),
		TE.chainFirst(() =>
			runCommand(`kubectl config use-context ${K8S_CTX}`, {
				printOutput: true,
				cwd: deployDir
			})
		),
		TE.chainFirst(() =>
			runCommand('helm dependency build', {
				printOutput: true,
				cwd: path.join(deployDir, 'chart')
			})
		),
		TE.chainFirst(() =>
			runCommand(
				`helm package ./chart --version ${context.projectInfo.version} --app-version ${context.projectInfo.version}`,
				{
					printOutput: true,
					cwd: path.join(deployDir)
				}
			)
		),
		TE.chainFirst(({ setValues, namespace }) =>
			runCommand(
				createFullHelmCommand(
					context.projectInfo.name,
					'template',
					tarFile,
					setValues,
					namespace
				),
				{
					printOutput: true,
					cwd: deployDir,
					env: shellVariables
				}
			)
		),
		TE.chainFirst(({ helmCommand, setValues, namespace }) =>
			runCommand(
				createFullHelmCommand(
					context.projectInfo.name,
					helmCommand,
					tarFile,
					setValues,
					namespace
				),
				{
					printOutput: true,
					cwd: deployDir,
					env: shellVariables
				}
			)
		)
	);

	if (!isHelm(context.projectType)) {
		return pipe(
			deployTE,
			TE.bind('deploymentName', () =>
				TE.fromEither(getDeploymentName(deployDir))
			),
			TE.chainFirst(({ deploymentName, namespace }) =>
				runCommand(
					`kubectl rollout restart deployment ${deploymentName} -n ${namespace}`,
					{
						printOutput: true,
						cwd: deployDir
					}
				)
			),
			TE.chainFirst(({ deploymentName, namespace }) =>
				runCommand(
					`kubectl rollout status deployment ${deploymentName} -n ${namespace}`,
					{
						printOutput: true,
						cwd: deployDir
					}
				)
			),
			TE.map(() => context)
		);
	}

	return pipe(
		deployTE,
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
