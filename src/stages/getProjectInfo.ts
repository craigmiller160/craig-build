import { Stage, StageFunction } from './Stage';
import { pipe } from 'fp-ts/function';
import { extractProjectType } from '../context/contextExtraction';
import * as E from 'fp-ts/Either';
import { ProjectType } from '../context/ProjectType';
import { ProjectInfo } from '../context/ProjectInfo';
import { match, when } from 'ts-pattern';
import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';
import {isDocker, isMaven, isNpm} from '../context/projectTypeUtils';

// TODO what do I do about dependencies?

const readMavenProjectInfo = (): E.Either<Error, ProjectInfo> => {
	throw new Error();
};

const readNpmProjectInfo = (): E.Either<Error, ProjectInfo> => {
	throw new Error();
};

const readDockerProjectInfo = (): E.Either<Error, ProjectInfo> => {
	throw new Error();
};

const readProjectInfoByType = (
	projectType: ProjectType
): E.Either<Error, ProjectInfo> =>
	match(projectType)
		.with(when(isMaven), readMavenProjectInfo)
		.with(when(isNpm), readNpmProjectInfo)
		.with(when(isDocker), readDockerProjectInfo)
		.otherwise(() =>
			E.left(new Error(`Unsupported ProjectType: ${projectType}`))
		);

const execute: StageFunction = (context) =>
	pipe(
		extractProjectType(context),
		E.chain(readProjectInfoByType),
		E.map((_) => ({
			...context,
			projectInfo: O.some(_)
		})),
		TE.fromEither
	);

export const getProjectInfo: Stage = {
	name: 'Get Project Info',
	execute
};
