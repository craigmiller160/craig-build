import '@relmify/jest-fp-ts';
import { baseWorkingDir } from '../testutils/baseWorkingDir';
import { getCwdMock } from '../testutils/getCwdMock';
import path from 'path';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import * as O from 'fp-ts/Option';
import { ProjectType } from '../../src/context/ProjectType';
import { pipe } from 'fp-ts/function';
import { validateDependencyVersions } from '../../src/stages/validateDependencyVersions';

const baseBuildContext = createBuildContext();

describe('validateDependencyVersions', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('skips validation for pre-release maven project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'mavenSnapshotApplication')
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: O.some(ProjectType.MavenApplication),
			projectInfo: pipe(
				baseBuildContext.projectInfo,
				O.map((_) => ({
					..._,
					isPreRelease: true
				}))
			)
		};
		const result = await validateDependencyVersions.execute(buildContext)();
		expect(result).toEqualRight(buildContext);
	});

	it('skips validation for pre-release npm project', async () => {
		getCwdMock.mockImplementation(() =>
			path.resolve(baseWorkingDir, 'npmBetaApplication')
		);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: O.some(ProjectType.NpmApplication),
			projectInfo: pipe(
				baseBuildContext.projectInfo,
				O.map((_) => ({
					..._,
					isPreRelease: true
				}))
			)
		};
		const result = await validateDependencyVersions.execute(buildContext)();
		expect(result).toEqualRight(buildContext);
	});

	it('validates release dependencies for maven project', async () => {
		throw new Error();
	});

	it('validates release dependencies for npm project', async () => {
		throw new Error();
	});
});
