import { Stage, StageFunction } from './Stage';
import { PackageJson } from '../configFileTypes/PackageJson';
import { pipe } from 'fp-ts/function';
import { readFile } from '../functions/readFile';
import path from 'path';
import * as E from 'fp-ts/Either';
import { parseJson } from '../functions/Json';
import { npmSeparateGroupAndName } from '../utils/npmSeparateGroupAndName';
import { BuildToolInfo } from '../context/BuildToolInfo';
import { BuildContext } from '../context/BuildContext';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';

const execute: StageFunction = (context) =>
	pipe(
		readFile(path.resolve(__dirname, '..', 'package.json')),
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
			(_): BuildContext => ({
				...context,
				buildToolInfo: O.some(_)
			})
		),
		TE.fromEither
	);

export const getBuildToolInfo: Stage = {
	name: 'Get Build Tool Info',
	execute
};
