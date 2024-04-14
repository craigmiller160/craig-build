import { test } from 'vitest';
import { RepoType } from '../../src/context/ProjectInfo';

test.each<RepoType>(['polyrepo', 'monorepo'])(
	'validateMonorepoVersion should stage execute for %s',
	(repoType) => {
		throw new Error();
	}
);

test.fails('validateMonorepoVersion executes');