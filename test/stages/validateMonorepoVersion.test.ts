import { expect, test } from 'vitest';
import { ProjectInfo, RepoType } from '../../src/context/ProjectInfo';
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
	valid: boolean;
}>;

test.each<ExecuteArgs>([
	{
		label: 'All version types are release',
		parentVersionType: VersionType.Release,
		childVersionTypes: [VersionType.Release, VersionType.Release],
		valid: true
	},
	{
		label: 'Parent version type is pre-release, children are mixed',
		parentVersionType: VersionType.PreRelease,
		childVersionTypes: [VersionType.Release, VersionType.PreRelease],
		valid: true
	},
	{
		label: 'Parent version type is release, children are mixed',
		parentVersionType: VersionType.Release,
		childVersionTypes: [VersionType.Release, VersionType.PreRelease],
		valid: false
	}
])(
	'validateMonorepoVersion executes for $label',
	async ({ parentVersionType, childVersionTypes, valid }) => {
		const projectInfo = baseContext.projectInfo;
		const context: BuildContext = {
			...baseContext,
			projectInfo: {
				...projectInfo,
				repoType: 'monorepo',
				versionType: parentVersionType,
				monorepoChildren: childVersionTypes.map(
					(versionType): ProjectInfo => ({
						...projectInfo,
						versionType
					})
				)
			}
		};
		const result = await validateMonorepoVersions.execute(context)();
		if (valid) {
			expect(result).toEqualRight(context);
		} else {
			expect(result).toEqualLeft(
				new Error('Invalid version types in monorepo child projects')
			);
		}
	}
);
