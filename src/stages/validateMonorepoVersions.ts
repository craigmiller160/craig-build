import { taskEither } from 'fp-ts';
import { Stage } from './Stage';

export const validateMonorepoVersions: Stage = {
	name: 'Validate Monorepo Versions',
	execute: (c) => taskEither.right(c),
	shouldStageExecute: () => true
};
