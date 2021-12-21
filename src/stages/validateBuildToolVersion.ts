import { Stage, StageFunction } from './Stage';
import { BuildContext } from '../context/BuildContext';
import { match, when } from 'ts-pattern';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import { BuildToolInfo } from '../context/BuildToolInfo';
import * as TE from 'fp-ts/TaskEither';

const handleReleaseVersionValidation = (
	buildToolInfo: BuildToolInfo
): TE.TaskEither<Error, BuildToolInfo> => {
	// TODO finish this
	throw new Error();
};

const handlePreReleaseVersionValidation = (
	buildToolInfo: BuildToolInfo
): TE.TaskEither<Error, BuildToolInfo> => {
	// TODO finish this
	throw new Error();
};

const checkBuildToolInfo = (
	buildToolInfo: BuildToolInfo
): TE.TaskEither<Error, BuildToolInfo> =>
	match(buildToolInfo)
		.with({ isPreRelease: true }, handlePreReleaseVersionValidation)
		.otherwise(handleReleaseVersionValidation);

const execute: StageFunction = (context: BuildContext) =>
	pipe(
		context.buildToolInfo,
		TE.fromOption(
			() =>
				new Error(
					'Cannot validate build tool version when BuildToolInfo is not present'
				)
		),
		TE.chain(checkBuildToolInfo),
		TE.map(() => context)
	);

export const validateBuildToolVersion: Stage = {
	name: 'Validate Build Tool Version',
	execute
};
