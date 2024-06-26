import { BuildContext } from '../context/BuildContext';
import {
	either,
	function as func,
	monoid,
	predicate,
	readonlyArray,
	taskEither
} from 'fp-ts';
import { match, P } from 'ts-pattern';
import { isApplication, isHelm } from '../context/projectTypeUtils';
import path from 'path';
import { getCwd } from '../command/getCwd';
import { runCommand } from '../command/runCommand';
import { Stage, StageExecuteFn } from './Stage';
import { createDockerImageTag } from '../utils/dockerUtils';
import { readHelmProject } from '../projectReading';
import shellEnv from 'shell-env';
import { CommandType } from '../context/CommandType';
import { isTerraformOnly } from '../context/commandTypeUtils';

const setValuesMonoid: monoid.Monoid<string> = {
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

// const getDeploymentName = (deployDir: string): E.Either<Error, string> =>
// 	pipe(
// 		readFile(path.join(deployDir, 'chart', 'values.yml')),
// 		E.chain((_) => parseYaml<DeploymentValues>(_)),
// 		E.map((_) => _['app_deployment'].appName)
// 	);

const getNamespace = (context: BuildContext): either.Either<Error, string> => {
	if (!isHelm(context.projectType)) {
		return either.right(K8S_NS);
	}

	return func.pipe(
		readHelmProject(),
		either.map((_) => _.namespace)
	);
};

const createHelmSetValues = (
	context: BuildContext
): either.Either<Error, string> => {
	if (!isHelm(context.projectType)) {
		const image = createDockerImageTag(context.projectInfo);
		return either.right(`--set app_deployment.image=${image}`);
	}

	return func.pipe(
		readHelmProject(),
		either.map((_) => _.setValues ?? {}),
		either.map(
			func.flow(
				Object.entries,
				readonlyArray.map(([key, value]) => `--set ${key}=${value}`),
				monoid.concatAll(setValuesMonoid)
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
	`helm ${helmCommand} ${appName} ${tarName} --kube-context=${K8S_CTX} --wait --timeout 5m --namespace ${namespace} --values ./chart/values.yml ${setValues}`;

const doDeploy = (
	context: BuildContext
): taskEither.TaskEither<Error, BuildContext> => {
	const deployDir = path.join(getCwd(), 'deploy');
	const shellVariables = shellEnv.sync();
	const tarFile = path.join(
		deployDir,
		`${context.projectInfo.name}-${context.projectInfo.version}.tgz`
	);
	const deployTE = func.pipe(
		getNamespace(context),
		either.bindTo('namespace'),
		either.bind('setValues', () => createHelmSetValues(context)),
		taskEither.fromEither,
		taskEither.chainFirst(() =>
			runCommand(`kubectl config use-context ${K8S_CTX}`, {
				printOutput: true,
				cwd: deployDir
			})
		),
		taskEither.chainFirst(() =>
			runCommand(
				`helm package ./chart --version ${context.projectInfo.version} --app-version ${context.projectInfo.version}`,
				{
					printOutput: true,
					cwd: path.join(deployDir)
				}
			)
		),
		taskEither.chainFirst(({ setValues, namespace }) =>
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
		taskEither.chainFirst(({ setValues, namespace }) =>
			runCommand(
				createFullHelmCommand(
					context.projectInfo.name,
					'upgrade --install',
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

	return func.pipe(
		deployTE,
		taskEither.map(() => context)
	);
};

const handleDeployByProject = (
	context: BuildContext
): taskEither.TaskEither<Error, BuildContext> =>
	match(context)
		.with({ projectType: P.when(isApplication) }, doDeploy)
		.run();

const isNotTerraformOnly: predicate.Predicate<CommandType> =
	predicate.not(isTerraformOnly);

const execute: StageExecuteFn = (context) => handleDeployByProject(context);
const shouldStageExecute: predicate.Predicate<BuildContext> = func.pipe(
	(_: BuildContext) => isApplication(_.projectType),
	predicate.and((_) => isNotTerraformOnly(_.commandInfo.type))
);

export const deployToKubernetes: Stage = {
	name: 'Deploy to Kubernetes',
	execute,
	shouldStageExecute
};
