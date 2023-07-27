import { either } from 'fp-ts';
import yaml from 'yaml';
import { unknownToError } from './unknownToError';

export const parseYaml = <T>(yamlText: string): either.Either<Error, T> =>
	either.tryCatch(() => yaml.parse(yamlText) as T, unknownToError);
