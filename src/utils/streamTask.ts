import * as TE from 'fp-ts/TaskEither';
import { Stream } from 'stream';
import { unknownToError } from '../functions/unknownToError';

export const streamTask = (stream: Stream): TE.TaskEither<Error, void> =>
	TE.tryCatch(
		() =>
			new Promise((resolve, reject) => {
				stream.on('finish', resolve);
				stream.on('error', reject);
			}),
		unknownToError
	);
