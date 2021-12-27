import { SetupStage, EarlyStageFunction } from './Stage';
import { PackageJson } from '../configFileTypes/PackageJson';
import { pipe } from 'fp-ts/function';
import { readFile } from '../functions/File';
import path from 'path';
import * as E from 'fp-ts/Either';
import { parseJson } from '../functions/Json';
import { npmSeparateGroupAndName } from '../utils/npmSeparateGroupAndName';
import { BuildToolInfo } from '../context/BuildToolInfo';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import { NPM_PROJECT_FILE } from '../configFileTypes/constants';
import { IncompleteBuildContext } from '../context/IncompleteBuildContext';

const execute: EarlyStageFunction = (context) =>
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
				isPreRelease: version.includes('beta')
			})
		),
		E.map(
			(_): IncompleteBuildContext => ({
				...context,
				buildToolInfo: O.some(_)
			})
		),
		TE.fromEither
	);

export const getBuildToolInfo: SetupStage = {
	name: 'Get Build Tool Info',
	execute
};
