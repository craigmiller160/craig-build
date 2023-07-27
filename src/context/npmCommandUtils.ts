import { NpmBuildTool } from './NpmBuildTool';
import path from 'path';
import fs from 'fs';
import { getCwd } from '../command/getCwd';
import { either } from 'fp-ts';
import { match } from 'ts-pattern';

const getPackageLockJsonPath = () => path.join(getCwd(), 'package-lock.json');
const getYarnLockPath = () => path.join(getCwd(), 'yarn.lock');
const getPnpmLockYaml = () => path.join(getCwd(), 'pnpm-lock.yaml');

export const getNpmBuildTool = (): either.Either<Error, NpmBuildTool> => {
	if (fs.existsSync(getPackageLockJsonPath())) {
		return either.right('npm');
	}

	if (fs.existsSync(getYarnLockPath())) {
		return either.right('yarn');
	}

	if (fs.existsSync(getPnpmLockYaml())) {
		return either.right('pnpm');
	}

	return either.left(new Error('Unable to determine the NPM command to use'));
};

export const getNpmBuildToolInstallCommand = (
	npmBuildTool: NpmBuildTool
): string =>
	match(npmBuildTool)
		.with('npm', () => 'npm install')
		.with('yarn', () => 'yarn install')
		.with('pnpm', () => 'pnpm install')
		.run();
