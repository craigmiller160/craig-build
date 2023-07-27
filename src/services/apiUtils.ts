import { taskEither } from 'fp-ts';
import { AxiosResponse } from 'axios';

export const extractResponseData = taskEither.map(
	(res: AxiosResponse) => res.data
);
