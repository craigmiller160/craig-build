import * as E from 'fp-ts/es6/Either';
import * as A from 'fp-ts/es6/Array';
import * as O from 'fp-ts/es6/Option';
import ProjectType from '../ProjectType';
import fs from 'fs';
import path from 'path';
import getCwd from '../../../utils/getCwd';
import { pipe } from 'fp-ts/es6/pipeable';

export default (): E.Either<Error, ProjectType> =>
    pipe(
        fs.readdirSync(path.resolve(getCwd())),
        A.findFirst<string,ProjectType>((file) => {
            if (file === 'package.json') {
                return ProjectType.JavaScript;
            }
            if (file === 'pom.xml') {
                return ProjectType.Maven;
            }

            return undefined;
        }),
        E.fromOption<Error>(() => new Error())
    );