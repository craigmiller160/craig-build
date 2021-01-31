import identifyProject from './tasks/identifyProject';
import getProjectConfig from './tasks/getProjectConfig';
import * as A from 'fp-ts/es6/Array';
import * as E from 'fp-ts/es6/Either';
import { pipe } from 'fp-ts/es6/pipeable';

pipe(
    [identifyProject, getProjectConfig],
    A.reduce()
);


