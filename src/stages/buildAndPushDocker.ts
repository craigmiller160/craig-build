import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import * as P from 'fp-ts/Predicate';
import { match, when } from 'ts-pattern';
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

interface DockerCreds {
	readonly userName: string;
	readonly password: string;
}

const isDockerOrApplication: P.Predicate<ProjectType> = pipe(
	isApplication,
	P.or(isDocker)
);

const createDockerTag = (projectInfo: ProjectInfo): string =>
	`${DOCKER_REPO_PREFIX}/${projectInfo.name}:${projectInfo.version}`;

const getAndValidateDockerEnvVariables = (): TE.TaskEither<
	Error,
	DockerCreds
> =>
	pipe(
		O.of(shellEnv.sync<EnvironmentVariables>()),
		O.bindTo('env'),
		O.bind('userName', ({ env }) => O.fromNullable(env.NEXUS_DOCKER_USER)),
		O.bind('password', ({ env }) =>
			O.fromNullable(env.NEXUS_DOCKER_PASSWORD)
		),
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
		.with(
			when<string>((_) => _.length > 0),
			() => removeExistingImages(context)
		)
		.otherwise(() => TE.right(''));

const buildDockerImage = (dockerTag: string): TE.TaskEither<Error, string> =>
	runCommand(`sudo docker build --network=host -t ${dockerTag} .`, {
		printOutput: true
	});

const pushDockerImage = (dockerTag: string): TE.TaskEither<Error, string> =>
	runCommand(`sudo docker push ${dockerTag}`, { printOutput: true });

const runDockerBuild = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> => {
	const dockerTag = createDockerTag(context.projectInfo);
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
		.with({ projectType: when(isDockerOrApplication) }, runDockerBuild)
		.run();

const isNotKubernetesOnly: P.Predicate<CommandType> = P.not(isKubernetesOnly);

const shouldStageExecute: P.Predicate<BuildContext> = pipe(
	(_: BuildContext) => isDockerOrApplication(_.projectType),
	P.and((_) => isNotKubernetesOnly(_.commandInfo.type))
);

const execute: StageExecuteFn = (context) =>
	handleDockerBuildByProject(context);

export const buildAndPushDocker: Stage = {
	name: 'Build and Push Docker',
	execute,
	shouldStageExecute
};
