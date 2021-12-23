import { Context } from './Context';
import { LoggableBuildContext, toLoggable } from './LoggableBuildContext';
import { BuildContext } from './BuildContext';
import { match, when } from 'ts-pattern';
import * as O from 'fp-ts/Option';
import { IncompleteBuildContext } from './IncompleteBuildContext';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isOption = (value: any): value is O.Option<any> =>
	value._tag !== undefined;

// TODO write tests
export const toLoggableContext = (context: Context): LoggableBuildContext =>
	match(context)
		.with({ commandInfo: when(isOption) }, (_: IncompleteBuildContext) =>
			toLoggable(_)
		)
		.with(
			{ commandInfo: when((_) => !isOption(_)) },
			(_: BuildContext) => _
		)
		.run();
