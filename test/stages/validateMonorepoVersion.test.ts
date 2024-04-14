import { expect, test } from 'vitest';
import { RepoType } from '../../src/context/ProjectInfo';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { validateMonorepoVersions } from '../../src/stages/validateMonorepoVersions';
import { VersionType } from '../../src/context/VersionType';

const baseContext = createBuildContext();

test.each<RepoType>(['polyrepo', 'monorepo'])(
	'validateMonorepoVersion should stage execute for %s',
	(repoType) => {
		const context: BuildContext = {
			...baseContext,
			projectInfo: {
				...baseContext.projectInfo,
				repoType
			}
		};

		const result = validateMonorepoVersions.shouldStageExecute(context);
		expect(result).toEqual(repoType === 'monorepo');
	}
);

type ExecuteArgs = Readonly<{
	label: string;
	parentVersionType: VersionType;
	childVersionTypes: ReadonlyArray<VersionType>;
}>;

test.each<ExecuteArgs>([
	{
		label: 'All version types are release',
		parentVersionType: VersionType.Release,
		childVersionTypes: [VersionType.Release, VersionType.Release]
	},
	{
		label: 'Parent version type is pre-release, children are mixed',
		parentVersionType: VersionType.PreRelease,
		childVersionTypes: [VersionType.Release, VersionType.PreRelease]
	},
	{
		label: 'Parent version type is release, children are mixed',
		parentVersionType: VersionType.Release,
		childVersionTypes: [VersionType.Release, VersionType.PreRelease]
	}
])('validateMonorepoVersion executes for $label', () => {});
