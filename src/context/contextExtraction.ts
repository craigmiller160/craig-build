import { BuildContext } from './BuildContext';
import * as E from 'fp-ts/Either';
import { BuildToolInfo } from './BuildToolInfo';
import { pipe } from 'fp-ts/function';

export const extractBuildToolInfo = (
	context: BuildContext
): E.Either<Error, BuildToolInfo> =>
	pipe(
		context.buildToolInfo,
		E.fromOption(() => new Error('BuildContext is missing BuildToolInfo'))
	);
