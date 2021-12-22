import * as TE from 'fp-ts/TaskEither';
import { AxiosResponse } from 'axios';

export const extractResponseData = TE.map((res: AxiosResponse) => res.data);
