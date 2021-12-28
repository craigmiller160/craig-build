// TODO delete this whole file
import { IncompleteBuildContext } from './IncompleteBuildContext';
import * as E from 'fp-ts/Either';
import { flow } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import { BuildContext } from './BuildContext';

type FromIncompleteContextFn = (
	context: IncompleteBuildContext
) => E.Either<Error, BuildContext>;

export const fromIncompleteContext: FromIncompleteContextFn = flow(
	O.of,
	O.bindTo('context'),
	O.bind('commandInfo', ({ context }) => context.commandInfo),
	O.bind('buildToolInfo', ({ context }) => context.buildToolInfo),
	O.bind('projectType', ({ context }) => context.projectType),
	O.bind('projectInfo', ({ context }) => context.projectInfo),
	O.map(({ context, ...rest }) => rest), // eslint-disable-line @typescript-eslint/no-unused-vars
	E.fromOption(
		() => new Error('IncompleteBuildContext has not yet been completed')
	)
);
