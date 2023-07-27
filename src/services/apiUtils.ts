import { taskEither } from 'fp-ts';
import { AxiosResponse } from 'axios';

export const extractResponseData = TE.map((res: AxiosResponse) => res.data);
