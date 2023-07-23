import { NpmCommand } from './NpmCommand';
import path from 'path';
import fs from 'fs';
import { getCwd } from '../command/getCwd';
import * as Either from 'fp-ts/Either';

const getPackageLockJsonPath = () => path.join(getCwd(), 'package-lock.json');
const getYarnLockPath = () => path.join(getCwd(), 'yarn.lock');
const getPnpmLockYaml = () => path.join(getCwd(), 'pnpm-lock.yaml');

// TODO needs tests
export const getNpmCommand = (): Either.Either<Error, NpmCommand> => {
	if (fs.existsSync(getPackageLockJsonPath())) {
		return Either.right('npm');
	}

	if (fs.existsSync(getYarnLockPath())) {
		return Either.right('yarn');
	}

	if (fs.existsSync(getPnpmLockYaml())) {
		return Either.right('pnpm');
	}

	return Either.left(
		new Error('Unable to determine the yarn command to use')
	);
};
