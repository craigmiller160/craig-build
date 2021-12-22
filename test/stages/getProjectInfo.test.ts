import { getCwdMock } from '../testutils/getCwdMock';
import path from 'path';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import * as O from 'fp-ts/Option';
import { ProjectType } from '../../src/context/ProjectType';
import { getProjectInfo } from '../../src/stages/getProjectInfo';
import '@relmify/jest-fp-ts';

const baseWorkingDirPath = path.resolve(
	process.cwd(),
	'test',
	'__working-dirs__'
);

const baseBuildContext = createBuildContext();

describe('getProjectInfo', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('NPM release project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDirPath, 'npmReleaseLibrary')
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: O.some(ProjectType.NpmLibrary)
		};
		const expectedContext: BuildContext = {
			...buildContext,
			projectInfo: O.some({
				group: 'craigmiller160',
				name: 'lib',
				version: '1.0.0',
				isPreRelease: false
			})
		};
		const result = await getProjectInfo.execute(buildContext);
		expect(result).toEqualRight(expectedContext);
	});

	it('NPM pre-release project', async () => {
		throw new Error();
	});

	it('Maven release project', async () => {
		throw new Error();
	});

	it('Maven pre-release project', async () => {
		throw new Error();
	});

	it('Docker release project', async () => {
		throw new Error();
	});

	it('Docker pre-release project', async () => {
		throw new Error();
	});
});
