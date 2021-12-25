import * as P from 'fp-ts/Predicate';
import {flow, pipe} from 'fp-ts/function';

const text = 'hello';

const lengthIs5 = (s: string): boolean => s.length === 5;
const startsWithH = (s: string): boolean => s.startsWith('h');
const endsWithO = (s: string): boolean => s.endsWith('oa')

const compare = P.and(lengthIs5)(startsWithH)
console.log(compare(text));

const result2 = pipe(
    lengthIs5,
    P.and(startsWithH),
    P.and(endsWithO)
)(text);
console.log(result2);

// const result = flow(
// 	(s: string) => lengthIs5(s),
// 	P.and(startsWithH)
// )(text);
//
// console.log(result);
