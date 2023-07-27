import { either } from 'fp-ts';
import yaml from 'yaml';
import { unknownToError } from './unknownToError';

export const parseYaml = <T>(yamlText: string): E.Either<Error, T> =>
	E.tryCatch(() => yaml.parse(yamlText) as T, unknownToError);
