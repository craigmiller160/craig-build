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
const runDockerBuild = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> => {
	const dockerTag = createDockerTag(context.projectInfo);
	return pipe(
		getAndValidateDockerEnvVariables(),
		TE.chain((_) =>
			runCommand('sudo docker login -u $USER_NAME -p $PASSWORD', {
				env: {
					USER_NAME: _.userName,
					PASSWORD: _.password
				},
				printOutput: true
			})
		),
		TE.chain(() =>
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
			)
		),
		TE.chain(() =>
			runCommand(`sudo docker build --network=host -t ${dockerTag}`, {
				printOutput: true
			})
		),
		TE.chain(() =>
			runCommand(`sudo docker push ${dockerTag}`, { printOutput: true })
		),
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
