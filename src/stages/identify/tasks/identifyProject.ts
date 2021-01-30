import * as E from 'fp-ts/es6/Either';
import * as A from 'fp-ts/es6/Array';
import * as O from 'fp-ts/es6/Option';
import fs from 'fs';
import path from 'path';
import getCwd from '../../../utils/getCwd';
import { pipe } from 'fp-ts/es6/pipeable';
import ProjectDescription from '../utils/ProjectDescription';
import BuildSystem from '../utils/BuildSystem';

// export default (): E.Either<Error, ProjectType> =>
//     pipe(
//         fs.readdirSync(path.resolve(getCwd())),
//         A.findFirst<string,ProjectType>((file) => {
//             if (file === 'package.json') {
//                 return ProjectType.JavaScript;
//             }
//             if (file === 'pom.xml') {
//                 return ProjectType.Maven;
//             }
//
//             return undefined;
//         }),
//         E.fromOption<Error>(() => new Error())
//     );

const NPM_PROJECT_FILE= 'package.json';
const MVN_PROJECT_FILE = 'pom.xml';
const DEPLOY_DIR = 'deploy';

const isDirectory = (file: string): boolean =>
    fs.lstatSync(path.resolve(getCwd(), file)).isDirectory();

export default (): E.Either<Error, ProjectDescription> =>
    pipe(
        fs.readdirSync(path.resolve(getCwd())),
        A.reduce<string, ProjectDescription>(
            O.none,
            (result: ProjectDescription, file: string) => {
                return {};
            }
            // (result: O.Option<ProjectDescription>, file: string) => {
            //     if (NPM_PROJECT_FILE === file) {
            //         return O.fold(
            //             (): ProjectDescription => ({
            //                 buildSystem: BuildSystem.NPM
            //             }),
            //             (desc: ProjectDescription): ProjectDescription => ({
            //                 ...desc,
            //                 buildSystem: BuildSystem.NPM
            //             })
            //         )(result);
            //     } else if (MVN_PROJECT_FILE === file) {
            //         return O.fold(
            //             (): ProjectDescription => ({
            //                 buildSystem: BuildSystem.Maven
            //             }),
            //             (desc: ProjectDescription): ProjectDescription => ({
            //                 ...desc,
            //                 buildSystem: BuildSystem.Maven
            //             })
            //         )(result);
            //     } else if (DEPLOY_DIR === file) {
            //         // O.fold()
            //         // TODO think about this
            //         return O.none;
            //     } else {
            //         return O.none;
            //     }
            // }
        ),
        // O.filter((desc: ProjectDescription) => !!desc.projectType),
        // E.fromOption(() => new Error()) // TODO enhance this
    );