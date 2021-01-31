import identifyProject from './tasks/identifyProject';
import getProjectConfig from './tasks/getProjectInfo';
import * as E from 'fp-ts/es6/Either';
import { pipe } from 'fp-ts/es6/pipeable';

const identify = (): E.Either<Error, any> =>
    pipe(
        identifyProject(),
        E.map((projectType) => getProjectConfig(projectType))
    );

export default identify;
