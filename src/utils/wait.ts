import * as T from 'fp-ts/Task';

export default (millis: number): T.Task<unknown> => () => new Promise((resolve) => setTimeout(resolve, millis));
