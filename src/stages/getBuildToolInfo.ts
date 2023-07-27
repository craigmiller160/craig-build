import { PackageJson } from '../configFileTypes/PackageJson';
import { function as func } from 'fp-ts';
import { readFile } from '../functions/File';
import path from 'path';
import { either } from 'fp-ts';
import { parseJson } from '../functions/Json';
import { npmSeparateGroupAndName } from '../utils/npmSeparateGroupAndName';
import { BuildToolInfo } from '../context/BuildToolInfo';
import * as Pred from 'fp-ts/Predicate';
import { taskEither } from 'fp-ts';
import { NPM_PROJECT_FILE } from '../configFileTypes/constants';
import { Stage, StageExecuteFn } from './Stage';
import { BuildContext } from '../context/BuildContext';
import { VersionType } from '../context/VersionType';
import { match } from 'ts-pattern';
import { regexTest } from '../functions/RegExp';

const VERSION_REGEX = /^.*-beta.*$/;

const getVersionType = (version: string): VersionType =>
	match(version)
		.when(regexTest(VERSION_REGEX), () => VersionType.PreRelease)
		.otherwise(() => VersionType.Release);

const execute: StageExecuteFn = (context) =>
	pipe(
		readFile(path.resolve(__dirname, '..', '..', NPM_PROJECT_FILE)),
		E.chain((_) => parseJson<PackageJson>(_)),
		E.map((_) => {
			const [group, name] = npmSeparateGroupAndName(_.name);
			return [group, name, _.version];
		}),
		E.map(
			([group, name, version]): BuildToolInfo => ({
				group,
				name,
				version,
				versionType: getVersionType(version)
			})
		),
		E.map(
			(_): BuildContext => ({
				...context,
				buildToolInfo: _
			})
		),
		TE.fromEither
	);
const shouldStageExecute: Pred.Predicate<BuildContext> = () => true;

export const getBuildToolInfo: Stage = {
	name: 'Get Build Tool Info',
	execute,
	shouldStageExecute
};
