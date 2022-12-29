import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { match, P } from 'ts-pattern';
import { isApplication } from '../context/projectTypeUtils';
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
import { HelmSetValues } from '../configFileTypes/HelmJson';
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

const isDeploymentInstalled =
	(deploymentName: string) =>
	(text: string): boolean =>
		!!text
			.split('\n')
			.map((_) => _.trim())
			.filter((_) => _.length > 0)
			.map((row) => row.split(/\s/).map((_) => _.trim())[0])
			.find((name) => name === deploymentName);

const getHelmInstallOrUpgrade = (
	deploymentName: string
): TE.TaskEither<Error, string> =>
	pipe(
		runCommand(
			`helm list --kube-context=${K8S_CTX} --namespace ${K8S_NS}`,
			{
				printOutput: true
			}
		),
		TE.map(isDeploymentInstalled(deploymentName)),
		TE.map((isInstalled) => (isInstalled ? 'upgrade' : 'install'))
	);

const createHelmSetExpression = (
	extra: HelmSetValues
): E.Either<Error, string> =>
	pipe(
		getAndCacheHelmProject(),
		E.map((_) => _.setValues ?? {}),
		E.map(
			(_): HelmSetValues => ({
				..._,
				...extra
			})
		),
		E.map(
			flow(
				Object.entries,
				RArray.map(([key, value]) => `--set ${key}=${value}`),
				Monoid.concatAll(setValuesMonoid)
			)
		)
	);

const createFullHelmCommand = (
	deploymentName: string,
	helmCommand: string,
	image: string
): string =>
	`helm ${helmCommand} ${deploymentName} ./chart --kube-context=${K8S_CTX} --namespace ${K8S_NS} --values ./chart/values.yml --set app-deployment.image=${image}`;

const doDeploy = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> => {
	const deployDir = path.join(getCwd(), 'deploy');
	const image = createDockerImageTag(context.projectInfo);
	const shellVariables = shellEnv.sync();
	return pipe(
		getDeploymentName(deployDir),
		TE.fromEither,
		TE.bindTo('deploymentName'),
		TE.bind('helmCommand', ({ deploymentName }) =>
			getHelmInstallOrUpgrade(deploymentName)
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
		TE.chainFirst(({ deploymentName }) =>
			runCommand(
				createFullHelmCommand(deploymentName, 'template', image),
				{
					printOutput: true,
					cwd: deployDir,
					env: shellVariables
				}
			)
		),
		TE.chainFirst(({ deploymentName, helmCommand }) =>
			runCommand(
				createFullHelmCommand(deploymentName, helmCommand, image),
				{
					printOutput: true,
					cwd: deployDir,
					env: shellVariables
				}
			)
		),
		TE.chainFirst(({ deploymentName }) =>
			runCommand(
				`kubectl rollout restart deployment ${deploymentName} -n ${K8S_NS}`,
				{
					printOutput: true,
					cwd: deployDir
				}
			)
		),
		TE.chainFirst(({ deploymentName }) =>
			runCommand(
				`kubectl rollout status deployment ${deploymentName} -n ${K8S_NS}`,
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
