import { BuildContext } from '../context/BuildContext';
import { taskEither } from 'fp-ts';
import { predicate } from 'fp-ts';
import { match, P } from 'ts-pattern';
import { ProjectType } from '../context/ProjectType';
import { function as func } from 'fp-ts';
import { isApplication, isDocker, isHelm } from '../context/projectTypeUtils';
import { DOCKER_REPO_PREFIX } from '../configFileTypes/constants';
import { runCommand } from '../command/runCommand';
import { Stage, StageExecuteFn } from './Stage';
import { CommandType } from '../context/CommandType';
import { isKubernetesOnly, isTerraformOnly } from '../context/commandTypeUtils';
import path from 'path';
import { getCwd } from '../command/getCwd';
import { createDockerImageTag } from '../utils/dockerUtils';
import {
	getNexusCredentials,
	NexusCredentials
} from '../utils/getNexusCredentials';
import os from 'os';

const getCmdSudo = (): string =>
	match(os.type())
		.with('Darwin', () => '')
		.otherwise(() => 'sudo ');

const isDockerOrApplication: predicate.Predicate<ProjectType> = func.pipe(
	isApplication,
	predicate.or(isDocker)
);

const loginToNexusDocker = (
	creds: NexusCredentials
): taskEither.TaskEither<Error, string> =>
	runCommand(
		`${getCmdSudo()}docker login ${DOCKER_REPO_PREFIX} -u \${USERNAME} \${PASSWORD}`,
		{
			printOutput: true,
			env: {
				USERNAME: creds.userName,
				PASSWORD: creds.password
			},
			shell: true
		}
	);

const checkForExistingImages = (
	context: BuildContext
): taskEither.TaskEither<Error, string> => {
	const baseCommand = [
		`${getCmdSudo()}docker image ls`,
		`grep ${context.projectInfo.name}`,
		`grep ${context.projectInfo.version}`
	].join(' | ');
	const fullCommand = `${baseCommand} || true`;
	return runCommand(fullCommand, {
		printOutput: true
	});
};

const removeExistingImages = (
	context: BuildContext
): taskEither.TaskEither<Error, string> =>
	runCommand(
		[
			`${getCmdSudo()}docker image ls`,
			`grep ${context.projectInfo.name}`,
			`grep ${context.projectInfo.version}`,
			"awk '{ print $3 }'",
			`xargs ${getCmdSudo()}docker image rm -f`
		].join(' | '),
		{
			printOutput: true
		}
	);

const removeExistingImagesIfExist = (
	existingImages: string,
	context: BuildContext
): taskEither.TaskEither<Error, string> =>
	match(existingImages)
		.when(
			(_) => _.length > 0,
			() => removeExistingImages(context)
		)
		.otherwise(() => taskEither.right(''));

const buildDockerImage = (
	dockerTag: string
): taskEither.TaskEither<Error, string> =>
	runCommand(
		`${getCmdSudo()}docker build --platform linux/amd64 --network=host -t ${dockerTag} .`,
		{
			printOutput: true,
			cwd: path.join(getCwd(), 'deploy')
		}
	);

const pushDockerImage = (
	dockerTag: string
): taskEither.TaskEither<Error, string> =>
	runCommand(`${getCmdSudo()}docker push ${dockerTag}`, {
		printOutput: true
	});

const runDockerBuild = (
	context: BuildContext
): taskEither.TaskEither<Error, BuildContext> => {
	const dockerTag = createDockerImageTag(context.projectInfo);
	return func.pipe(
		getNexusCredentials(),
		taskEither.fromEither,
		taskEither.chain(loginToNexusDocker),
		taskEither.chain(() => checkForExistingImages(context)),
		taskEither.chain((_) => removeExistingImagesIfExist(_, context)),
		taskEither.chain(() => buildDockerImage(dockerTag)),
		taskEither.chain(() => pushDockerImage(dockerTag)),
		taskEither.map(() => context)
	);
};

const handleDockerBuildByProject = (
	context: BuildContext
): taskEither.TaskEither<Error, BuildContext> =>
	match(context)
		.with({ projectType: P.when(isDockerOrApplication) }, runDockerBuild)
		.run();

const isNotKubernetesOnly: predicate.Predicate<CommandType> =
	predicate.not(isKubernetesOnly);
const isNotHelm: predicate.Predicate<ProjectType> = predicate.not(isHelm);
const isNotTerraformOnly: predicate.Predicate<CommandType> =
	predicate.not(isTerraformOnly);

const shouldStageExecute: predicate.Predicate<BuildContext> = func.pipe(
	(_: BuildContext) => isDockerOrApplication(_.projectType),
	predicate.and((_) => isNotKubernetesOnly(_.commandInfo.type)),
	predicate.and((_) => isNotHelm(_.projectType)),
	predicate.and((_) => isNotTerraformOnly(_.commandInfo.type))
);

const execute: StageExecuteFn = (context) =>
	handleDockerBuildByProject(context);

export const buildAndPushDocker: Stage = {
	name: 'Build and Push Docker',
	execute,
	shouldStageExecute
};
