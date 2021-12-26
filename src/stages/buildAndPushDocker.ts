import { Stage, StageFunction } from './Stage';
import { BuildContext } from '../context/BuildContext';
import * as TE from 'fp-ts/TaskEither';
import * as P from 'fp-ts/Predicate';
import { match, when } from 'ts-pattern';
import { ProjectType } from '../context/ProjectType';
import { pipe } from 'fp-ts/function';
import { isApplication, isDocker } from '../context/projectTypeUtils';
import { logger } from '../logger';
import { ProjectInfo } from '../context/ProjectInfo';
import { DOCKER_REPO_PREFIX } from '../configFileTypes/constants';
import shellEnv, {EnvironmentVariables} from 'shell-env';

type IsDockerOrApplication = (projectType: ProjectType) => boolean;
const isDockerOrApplication: IsDockerOrApplication = pipe(
	isApplication,
	P.or(isDocker)
);

const createDockerTag = (projectInfo: ProjectInfo): string =>
	`${DOCKER_REPO_PREFIX}/${projectInfo.name}:${projectInfo.version}`;

const runDockerBuild = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> => {
	const dockerTag = createDockerTag(context.projectInfo);
	shellEnv.sync<EnvironmentVariables>(); // TODO validate variables

	throw new Error();
};

const handleDockerBuildByProject = (
	context: BuildContext
): TE.TaskEither<Error, BuildContext> =>
	match(context)
		.with({ projectType: when(isDockerOrApplication) }, runDockerBuild)
		.otherwise(() => {
			logger.debug('Skipping stage');
			return TE.right(context);
		});

const execute: StageFunction = (context) => handleDockerBuildByProject(context);

export const buildAndPushDocker: Stage = {
	name: 'Build and Push Docker',
	execute
};
