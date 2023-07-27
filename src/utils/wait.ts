import { task } from 'fp-ts';

export const wait =
	(millis: number): task.Task<unknown> =>
	() =>
		new Promise((resolve) => setTimeout(resolve, millis));
