#!/usr/bin/env node

import { pipe } from 'fp-ts/function';
import { program } from 'commander';
import { parseJson } from './functions/parseJson';
import path from 'path';
import { readFile } from './functions/readFile';
import * as E from 'fp-ts/Either';
import PackageJson from './configFileTypes/PackageJson';

pipe(
	readFile(path.resolve(__dirname, '..', 'package.json')),
	E.chain((_) => parseJson<PackageJson>(_))
);
