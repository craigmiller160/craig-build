import identifyProject from './tasks/identifyProject';
import getProjectConfig from './tasks/getProjectInfo';
import * as E from 'fp-ts/es6/Either';
import { pipe } from 'fp-ts/es6/pipeable';
import ProjectInfo from '../../types/ProjectInfo';

const identify = (): E.Either<Error, ProjectInfo> =>
    pipe(
        identifyProject(),
        E.map((projectType) => getProjectConfig(projectType)),
        E.flatten
    );

export default identify;
