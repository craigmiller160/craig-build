import { taskEither } from 'fp-ts';
import { Stream } from 'stream';
import { unknownToError } from '../functions/unknownToError';

export const streamTask = (
	stream: Stream
): taskEither.TaskEither<Error, void> =>
	taskEither.tryCatch(
		() =>
			new Promise((resolve, reject) => {
				stream.on('finish', resolve);
				stream.on('error', reject);
			}),
		unknownToError
	);
