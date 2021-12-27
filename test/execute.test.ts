import { execute } from '../src/execute';
import { BuildContext } from '../src/context/BuildContext';
import {
	createBuildContext,
	createIncompleteBuildContext
} from './testutils/createBuildContext';
import { conditionalStages, setupStages } from '../src/stages';
import * as TE from 'fp-ts/TaskEither';
import '@relmify/jest-fp-ts';
import { Context } from '../src/context/Context';

describe('execute', () => {
	it('executes full build for MavenApplication', () => {
		throw new Error();
	});

	it('executes full build for MavenLibrary', () => {
		throw new Error();
	});

	it('executes full build for NpmApplication', () => {
		throw new Error();
	});

	it('executes full build for NpmLibrary', () => {
		throw new Error();
	});

	it('executes full build for NpmApplication', () => {
		throw new Error();
	});
});
