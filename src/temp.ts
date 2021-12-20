import * as M from 'pattern-matching-ts/match';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';

const result = pipe(
	O.some('Hello'),
	M.match<O.Option<string>, string>({
		Some: (value) => `${value} World`,
		None: () => 'Nothing'
	})
);

console.log('Result', result);
