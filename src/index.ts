#!/usr/bin/env node

import { pipe } from 'fp-ts/function';
import { program } from 'commander';
import { parseJson } from './functions/parseJson';
import path from 'path';
import { readFile } from './functions/readFile';
import * as E from 'fp-ts/Either';
import PackageJson from './configFileTypes/PackageJson';
import { getOrThrow } from './functions/getOrThrow';
import { setupBuildContext } from './setup';
import {execute} from './execute';
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

const buildContext = setupBuildContext(program.opts());
execute(buildContext); // TODO handle outcome of this