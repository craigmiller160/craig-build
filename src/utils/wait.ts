import * as T from 'fp-ts/Task';

export const wait =
	(millis: number): T.Task<unknown> =>
	() =>
		new Promise((resolve) => setTimeout(resolve, millis));
