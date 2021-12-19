import createTask, {
	TaskFunction,
	TaskShouldExecuteFunction
} from '../../../common/execution/task';
import ProjectInfo from '../../../types/ProjectInfo';
import { TaskContext } from '../../../common/execution/context';
import stageName from '../stageName';
import { executeIfPreRelease } from '../../../common/execution/commonTaskConditions';
import { isApplication, isDocker } from '../../../utils/projectTypeUtils';
import ProjectType from '../../../types/ProjectType';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import {
	searchForDockerReleases,
	searchForMavenSnapshots
} from '../../../common/services/NexusRepoApi';
import NexusSearchResult from '../../../types/NexusSearchResult';
import * as A from 'fp-ts/Array';
import * as O from 'fp-ts/Option';

export const TASK_NAME = 'Bump Docker Pre-Release Version';

const findNpmDockerPreReleaseVersion = (
	context: TaskContext<ProjectInfo>
): TE.TaskEither<Error, ProjectInfo> =>
	TE.right({
		...context.input,
		dockerPreReleaseVersion: context.input.version
	});

const findMavenDockerPreReleaseVersion = (
	context: TaskContext<ProjectInfo>
): TE.TaskEither<Error, ProjectInfo> =>
	pipe(
		searchForMavenSnapshots(context.input.group, context.input.name),
		TE.chain((results) => {
			if (results.items.length >= 1) {
				return TE.right(results.items[0].version);
			}

			return TE.left(
				context.createBuildError(
					'Cannot find pre-release Maven artifact to determine pre-release Docker version'
				)
			);
		}),
		TE.map(
			(version): ProjectInfo => ({
				...context.input,
				dockerPreReleaseVersion: version
			})
		)
	);

const findExistingBetaVersion = (
	nexusResult: NexusSearchResult,
	version: string
): string =>
	pipe(
		nexusResult.items,
		A.findFirst((nexusItem) => nexusItem.version.startsWith(version)),
		O.map((nexusItem) => nexusItem.version),
		O.getOrElse(() => version)
	);

const bumpBetaNumber = (betaNumber: string): string => {
	const [versionNumber, betaPart] = betaNumber.split('-');
	const [, number] = betaPart.split('.');
	return `${versionNumber}-beta.${parseInt(number ?? '0') + 1}`;
};

const findDockerOnlyPreReleaseVersion = (
	context: TaskContext<ProjectInfo>
): TE.TaskEither<Error, ProjectInfo> =>
	pipe(
		searchForDockerReleases(context.input.name),
		TE.map((nexusResult) =>
			findExistingBetaVersion(nexusResult, context.input.version)
		),
		TE.map(bumpBetaNumber),
		TE.map((betaNumber) => ({
			...context.input,
			dockerPreReleaseVersion: betaNumber
		}))
	);

const handleBumpDockerPreReleaseVersion = (
	context: TaskContext<ProjectInfo>
): TE.TaskEither<Error, ProjectInfo> => {
	switch (context.input.projectType) {
		case ProjectType.NpmApplication:
			return findNpmDockerPreReleaseVersion(context);
		case ProjectType.MavenApplication:
			return findMavenDockerPreReleaseVersion(context);
		case ProjectType.DockerApplication:
			return findDockerOnlyPreReleaseVersion(context);
		default:
			return TE.left(
				context.createBuildError(
					`Invalid ProjectType for bumping Docker beta: ${context.input.projectType}`
				)
			);
	}
};

const bumpDockerPreReleaseVersion: TaskFunction<ProjectInfo> = (
	context: TaskContext<ProjectInfo>
) =>
	pipe(
		handleBumpDockerPreReleaseVersion(context),
		TE.map((projectInfo) => ({
			message: `Bumped Docker pre-release version successfully: ${projectInfo.dockerPreReleaseVersion}`,
			value: projectInfo
		}))
	);

const shouldExecute: TaskShouldExecuteFunction<ProjectInfo> = (
	input: ProjectInfo
) => {
	if (isDocker(input.projectType) || isApplication(input.projectType)) {
		return undefined;
	}

	return {
		message: 'Is not application or a Docker project',
		defaultResult: input
	};
};

export default createTask(stageName, TASK_NAME, bumpDockerPreReleaseVersion, [
	shouldExecute,
	executeIfPreRelease
]);
