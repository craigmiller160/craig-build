import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import { match, P } from 'ts-pattern';
import { isApplication } from '../context/projectTypeUtils';
import { pipe } from 'fp-ts/function';
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

const K8S_CTX = 'microk8s-prod';
const K8S_NS = 'apps-prod';

const getDeploymentName = (deployDir: string): E.Either<Error, string> =>
	pipe(
		readFile(path.join(deployDir, 'chart', 'values.yml')),
		E.chain((_) => parseYaml<DeploymentValues>(_)),
		E.map((_) => _.appName)
	);

const isDeploymentInstalled = (deploymentName: string) => (text: string): boolean =>
	!!text.split('\n')
		.map((row) =>
			row.split(' ')
				.map((_) => _.trim())[0]
		)
		.find((name) => name === deploymentName);

const getHelmInstallOrUpgrade = (deploymentName: string): TE.TaskEither<Error, string> => {
	pipe(
		runCommand(
			`helm list --kube-context=${K8S_CTX} --namespace ${K8S_NS}`,
			{
				printOutput: true
			}
		),
		TE.map(isDeploymentInstalled(deploymentName))
	);
};

// TODO how to handle install vs upgrade?
const doDeploy = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> => {
	const deployDir = path.join(getCwd(), 'deploy');
	const image = createDockerImageTag(context.projectInfo);
	return pipe(
		getDeploymentName(deployDir),
		TE.fromEither,
		TE.chainFirst(() =>
			runCommand(`kubectl config use-context ${K8S_CTX}`, {
				printOutput: true,
				cwd: deployDir
			})
		),
		TE.chainFirst((deploymentName) =>
			runCommand(
				`helm install ${deploymentName} ./chart --kube-context=${K8S_CTX} --namespace ${K8S_NS} --values ./chart/values.yml --set app_deployment.deployment.image ${image}`,
				{
					printOutput: true,
					cwd: deployDir
				}
			)
		),
		TE.chainFirst((deploymentName) =>
			runCommand(
				`kubectl rollout restart deployment ${deploymentName} -n ${K8S_NS}`,
				{
					printOutput: true,
					cwd: deployDir
				}
			)
		),
		TE.chainFirst((deploymentName) =>
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
