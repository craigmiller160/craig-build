import { test, expect } from 'vitest';
import { RepoType } from '../../src/context/ProjectInfo';
import { createBuildContext } from '../testutils/createBuildContext';
import { BuildContext } from '../../src/context/BuildContext';
import { validateMonorepoVersions } from '../../src/stages/validateMonorepoVersions';

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

test.fails('validateMonorepoVersion executes');
