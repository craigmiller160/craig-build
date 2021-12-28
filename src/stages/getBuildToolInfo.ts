import { PackageJson } from '../configFileTypes/PackageJson';
import { pipe } from 'fp-ts/function';
import { readFile } from '../functions/File';
import path from 'path';
import * as E from 'fp-ts/Either';
import { parseJson } from '../functions/Json';
import { npmSeparateGroupAndName } from '../utils/npmSeparateGroupAndName';
import { BuildToolInfo } from '../context/BuildToolInfo';
import * as P from 'fp-ts/Predicate';
import * as TE from 'fp-ts/TaskEither';
import { NPM_PROJECT_FILE } from '../configFileTypes/constants';
import { Stage, StageExecuteFn } from './Stage';
import { BuildContext } from '../context/BuildContext';
import { VersionType } from '../context/VersionType';
import { match, when } from 'ts-pattern';

const VERSION_REGEX = /^.*-beta$/;

const getVersionType = (version: string): VersionType =>
	match(version)
		.with(
			when<string>((_) => VERSION_REGEX.test(_)),
			() => VersionType.PreRelease
		)
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
const commandAllowsStage: P.Predicate<BuildContext> = () => true;
const projectAllowsStage: P.Predicate<BuildContext> = () => true;

export const getBuildToolInfo: Stage = {
	name: 'Get Build Tool Info',
	execute,
	commandAllowsStage,
	projectAllowsStage
};
