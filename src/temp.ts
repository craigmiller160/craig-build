import * as O from 'fp-ts/Option';
import { pipe, flow } from 'fp-ts/function';
import * as E from 'fp-ts/Either';

interface IncContext {
	readonly name: O.Option<string>;
	readonly age: O.Option<number>;
}

interface CompleteContext {
	readonly name: string;
	readonly age: number;
}

const unfinishedContext: IncContext = {
	name: O.some('Bob'),
	age: O.none
};

const finishedContext: IncContext = {
	name: O.some('Bob'),
	age: O.some(20)
};

type HandleContextFn = (
	incContext: IncContext
) => E.Either<Error, CompleteContext>;
// const handleContext: HandleContextFn = flow(
// 	O.of,
// 	O.bind('name', (ctx) => ctx.name),
// 	E.fromOption(() => new Error())
// );
const handleContext2: HandleContextFn = (incContext) =>
	pipe(
		O.of(incContext),
		O.bindTo('incContext'),
		O.bind('name', (ctx) => ctx.incContext.name),
		E.fromOption(() => new Error()),
		E.map(() => ({
			name: 'foo',
			age: 10
		}))
	);
const handleContext: HandleContextFn = flow(
	O.of,
	O.bindTo('incContext'),
	O.bind('name', (ctx) => ctx.incContext.name),
	O.bind('age', (ctx) => ctx.incContext.age),
	E.fromOption(() => new Error('Incomplete Context')),
	E.map(({ name, age }) => ({
		name,
		age
	}))
);

const unfinishedResult = handleContext(unfinishedContext);
const finishedResult = handleContext(finishedContext);
console.log(unfinishedResult);
console.log(finishedResult);
