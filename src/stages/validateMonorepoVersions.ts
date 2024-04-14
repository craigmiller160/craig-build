import { taskEither } from 'fp-ts';
import { Stage } from './Stage';
import { predicate } from 'fp-ts';
import { BuildContext } from '../context/BuildContext';

const shouldStageExecute: predicate.Predicate<BuildContext> = (context) =>
	context.projectInfo.repoType === 'monorepo';

export const validateMonorepoVersions: Stage = {
	name: 'Validate Monorepo Versions',
	execute: (c) => taskEither.right(c),
	shouldStageExecute
};
