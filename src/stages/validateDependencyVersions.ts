import { Stage, StageFunction } from './Stage';
import * as E from 'fp-ts/Either';
import { ProjectInfo } from '../context/ProjectInfo';

const validateMavenReleaseDependencies = (): E.Either<Error, void> => {
	throw new Error();
};

const validateNpmReleaseDependencies = (): E.Either<Error, void> => {
	throw new Error();
};

const execute: StageFunction = (context) => {
	throw new Error();
};

export const validateDependencyVersions: Stage = {
	name: 'Validate Dependency Versions',
	execute
};
