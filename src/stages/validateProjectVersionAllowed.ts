import { Stage, StageFunction } from './Stage';
import { ProjectType } from '../context/ProjectType';
import { ProjectInfo } from '../context/ProjectInfo';
import { BuildContext } from '../context/BuildContext';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import {
	extractProjectInfo,
	extractProjectType
} from '../context/contextExtraction';
import * as TE from 'fp-ts/TaskEither';

interface ExtractedValues {
	projectType: ProjectType;
	projectInfo: ProjectInfo;
	isPreRelease: boolean;
}

const extractValues = (
	context: BuildContext
): E.Either<Error, ExtractedValues> =>
	pipe(
		extractProjectType(context),
		E.chain((projectType) =>
			pipe(
				extractProjectInfo(context),
				E.map(
					(projectInfo): ExtractedValues => ({
						projectType,
						projectInfo,
						isPreRelease: projectInfo.isPreRelease
					})
				)
			)
		)
	);

const execute: StageFunction = (context) =>
	pipe(
		extractValues(context),
		E.map(() => context),
		TE.fromEither
	);

export const validateProjectVersionAllowed: Stage = {
	name: 'Validate Project Version Allowed',
	execute
};
