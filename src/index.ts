#!/usr/bin/env node

import { pipe } from 'fp-ts/function';
import { OptionValues, program } from 'commander';
import { parseJson } from './functions/parseJson';
import path from 'path';
import { readFile } from './functions/readFile';
import * as E from 'fp-ts/Either';
import PackageJson from './configFileTypes/PackageJson';
import { getOrThrow } from './functions/getOrThrow';
import { match } from 'ts-pattern';
import { CommandInfo } from './context/CommandInfo';
import { CommandType } from './context/CommandType';
import { BuildContext } from './context/BuildContext';

const packageJson: PackageJson = pipe(
	readFile(path.resolve(__dirname, '..', 'package.json')),
	E.chain((_) => parseJson<PackageJson>(_)),
	getOrThrow
);

program
	.version(packageJson.version)
	.option('-b, --full-build', 'Fully build and deploy the project')
	.option('-d, --docker-only', 'Build and deploy only the Docker image')
	.option('-k, --kubernetes-only', 'Deploy to Kubernetes only')
	.parse(process.argv);

const constructCommandInfo = (): CommandInfo =>
	match<OptionValues, CommandInfo>(program.opts())
		.with({ fullBuild: true }, () => ({ type: CommandType.FULL_BUILD }))
		.with({ dockerOnly: true }, () => ({ type: CommandType.DOCKER_ONLY }))
		.with({ kubernetesOnly: true }, () => ({
			type: CommandType.KUBERNETES_ONLY
		}))
		.run();

const constructInitialBuildContext = (): BuildContext => ({
	commandInfo: constructCommandInfo()
});
