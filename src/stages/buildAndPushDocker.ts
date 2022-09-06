import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import * as Pred from 'fp-ts/Predicate';
import { match, P } from 'ts-pattern';
import { ProjectType } from '../context/ProjectType';
import { pipe } from 'fp-ts/function';
import { isApplication, isDocker } from '../context/projectTypeUtils';
import { ProjectInfo } from '../context/ProjectInfo';
import { DOCKER_REPO_PREFIX } from '../configFileTypes/constants';
import shellEnv from 'shell-env';
import { EnvironmentVariables } from '../env/EnvironmentVariables';
import * as O from 'fp-ts/Option';
import { runCommand } from '../command/runCommand';
import { Stage, StageExecuteFn } from './Stage';
import { CommandType } from '../context/CommandType';
import { isKubernetesOnly } from '../context/commandTypeUtils';
import path from 'path';
import { getCwd } from '../command/getCwd';
import { createDockerImageTag } from '../utils/dockerUtils';

interface DockerCreds {
	readonly userName: string;
	readonly password: string;
}

const isDockerOrApplication: Pred.Predicate<ProjectType> = pipe(
	isApplication,
	Pred.or(isDocker)
);

const getAndValidateDockerEnvVariables = (): TE.TaskEither<
	Error,
	DockerCreds
> =>
	pipe(
		O.of(shellEnv.sync<EnvironmentVariables>()),
		O.bindTo('env'),
		O.bind('userName', ({ env }) => O.fromNullable(env.NEXUS_USER)),
		O.bind('password', ({ env }) => O.fromNullable(env.NEXUS_PASSWORD)),
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		O.map(({ env, ...creds }): DockerCreds => creds),
		TE.fromOption(
			() => new Error('Missing Docker credential environment variables')
		)
	);

const loginToNexusDocker = (creds: DockerCreds): TE.TaskEither<Error, string> =>
	runCommand(
		`sudo docker login ${DOCKER_REPO_PREFIX} -u \${user} -p \${password}`,
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
		'sudo docker image ls',
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
			'sudo docker image ls',
			`grep ${context.projectInfo.name}`,
			`grep ${context.projectInfo.version}`,
			"awk '{ print $3 }'",
			'xargs sudo docker image rm -f'
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
		`sudo docker build --platform amd64 --network=host -t ${dockerTag} .`,
		{
			printOutput: true,
			cwd: path.join(getCwd(), 'deploy')
		}
	);

const pushDockerImage = (dockerTag: string): TE.TaskEither<Error, string> =>
	runCommand(`sudo docker push ${dockerTag}`, { printOutput: true });

const runDockerBuild = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> => {
	const dockerTag = createDockerImageTag(context.projectInfo);
	return pipe(
		getAndValidateDockerEnvVariables(),
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

const shouldStageExecute: Pred.Predicate<BuildContext> = pipe(
	(_: BuildContext) => isDockerOrApplication(_.projectType),
	Pred.and((_) => isNotKubernetesOnly(_.commandInfo.type))
);

const execute: StageExecuteFn = (context) =>
	handleDockerBuildByProject(context);

export const buildAndPushDocker: Stage = {
	name: 'Build and Push Docker',
	execute,
	shouldStageExecute
};
