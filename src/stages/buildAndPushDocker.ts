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

const isDockerOrApplication: Pred.Predicate<ProjectType> = pipe(
	isApplication,
	Pred.or(isDocker)
);

const loginToNexusDocker = (
	creds: NexusCredentials
): TE.TaskEither<Error, string> =>
	runCommand(
		`${getCmdSudo()}docker login ${DOCKER_REPO_PREFIX} -u \${user} -p \${password}`,
		{
			printOutput: true,
			variables: {
				user: creds.userName,
				password: creds.password
			}
		}
	);

const checkForExistingImages = (
	context: BuildContext
): TE.TaskEither<Error, string> => {
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
): TE.TaskEither<Error, string> =>
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
): TE.TaskEither<Error, string> =>
	match(existingImages)
		.when(
			(_) => _.length > 0,
			() => removeExistingImages(context)
		)
		.otherwise(() => TE.right(''));

const buildDockerImage = (dockerTag: string): TE.TaskEither<Error, string> =>
	runCommand(
		`${getCmdSudo()}docker build --platform linux/amd64 --network=host -t ${dockerTag} .`,
		{
			printOutput: true,
			cwd: path.join(getCwd(), 'deploy')
		}
	);

const pushDockerImage = (dockerTag: string): TE.TaskEither<Error, string> =>
	runCommand(`${getCmdSudo()}docker push ${dockerTag}`, {
		printOutput: true
	});

const runDockerBuild = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> => {
	const dockerTag = createDockerImageTag(context.projectInfo);
	return pipe(
		getNexusCredentials(),
		TE.fromEither,
		TE.chain(loginToNexusDocker),
		TE.chain(() => checkForExistingImages(context)),
		TE.chain((_) => removeExistingImagesIfExist(_, context)),
		TE.chain(() => buildDockerImage(dockerTag)),
		TE.chain(() => pushDockerImage(dockerTag)),
		TE.map(() => context)
	);
};

const handleDockerBuildByProject = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	match(context)
		.with({ projectType: P.when(isDockerOrApplication) }, runDockerBuild)
		.run();

const isNotKubernetesOnly: Pred.Predicate<CommandType> =
	Pred.not(isKubernetesOnly);
const isNotHelm: Pred.Predicate<ProjectType> = Pred.not(isHelm);
const isNotTerraformOnly: Pred.Predicate<CommandType> =
	Pred.not(isTerraformOnly);

const shouldStageExecute: Pred.Predicate<BuildContext> = pipe(
	(_: BuildContext) => isDockerOrApplication(_.projectType),
	Pred.and((_) => isNotKubernetesOnly(_.commandInfo.type)),
	Pred.and((_) => isNotHelm(_.projectType)),
	Pred.and((_) => isNotTerraformOnly(_.commandInfo.type))
);

const execute: StageExecuteFn = (context) =>
	handleDockerBuildByProject(context);

export const buildAndPushDocker: Stage = {
	name: 'Build and Push Docker',
	execute,
	shouldStageExecute
};
