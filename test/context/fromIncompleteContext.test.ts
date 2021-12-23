import { fromIncompleteContext } from '../../src/context/fromIncompleteContext';
import { IncompleteBuildContext } from '../../src/context/IncompleteBuildContext';
import * as O from 'fp-ts/Option';
import { CommandType } from '../../src/context/CommandType';
import { ProjectType } from '../../src/context/ProjectType';
import '@relmify/jest-fp-ts';

const completeContext: IncompleteBuildContext = {
	commandInfo: O.some({
		type: CommandType.FULL_BUILD
	}),
	buildToolInfo: O.some({
		group: '',
		name: '',
		version: '',
		isPreRelease: false
	}),
	projectType: O.some(ProjectType.DockerApplication),
	projectInfo: O.some({
		group: '',
		name: '',
		version: '',
		isPreRelease: false
	})
};

describe('fromIncompleteContext', () => {
	it('context is complete', () => {
		expect(fromIncompleteContext(completeContext)).toEqualRight({
			commandInfo: {
				type: CommandType.FULL_BUILD
			},
			buildToolInfo: {
				group: '',
				name: '',
				version: '',
				isPreRelease: false
			},
			projectType: ProjectType.DockerApplication,
			projectInfo: {
				group: '',
				name: '',
				version: '',
				isPreRelease: false
			}
		});
	});

	it('context is missing commandInfo', () => {
		expect(
			fromIncompleteContext({
				...completeContext,
				commandInfo: O.none
			})
		).toEqualLeft(
			new Error('IncompleteBuildContext has not yet been completed')
		);
	});

	it('context is missing buildToolInfo', () => {
		expect(
			fromIncompleteContext({
				...completeContext,
				buildToolInfo: O.none
			})
		).toEqualLeft(
			new Error('IncompleteBuildContext has not yet been completed')
		);
	});

	it('context is missing projectType', () => {
		expect(
			fromIncompleteContext({
				...completeContext,
				projectType: O.none
			})
		).toEqualLeft(
			new Error('IncompleteBuildContext has not yet been completed')
		);
	});

	it('context is missing projectInfo', () => {
		expect(
			fromIncompleteContext({
				...completeContext,
				projectInfo: O.none
			})
		).toEqualLeft(
			new Error('IncompleteBuildContext has not yet been completed')
		);
	});
});
