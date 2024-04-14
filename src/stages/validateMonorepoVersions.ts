import { Stage, StageExecuteFn } from './Stage';
import { predicate, taskEither } from 'fp-ts';
import { BuildContext } from '../context/BuildContext';
import { VersionType } from '../context/VersionType';

const execute: StageExecuteFn = (context) => {
	if (context.projectInfo.versionType === VersionType.PreRelease) {
		return taskEither.right(context);
	}

	const hasPreReleaseVersion = !!context.projectInfo.monorepoChildren
		?.map((childInfo) => childInfo.versionType)
		?.find((versionType) => VersionType.PreRelease === versionType);

	if (!hasPreReleaseVersion) {
		return taskEither.right(context);
	}
	return taskEither.left(
		new Error('Invalid version types in monorepo child projects')
	);
};

const shouldStageExecute: predicate.Predicate<BuildContext> = (context) =>
	context.projectInfo.repoType === 'monorepo';

export const validateMonorepoVersions: Stage = {
	name: 'Validate Monorepo Versions',
	execute,
	shouldStageExecute
};
