// TODO add retrieval of dependency versions here

import path from 'path';
import ProjectInfo from '../../../types/ProjectInfo';
import PackageJson from '../../../types/PackageJson';
import getCwd from '../../../utils/getCwd';
import fs from 'fs';
import PomXml from '../../../types/PomXml';
import { Parser } from 'xml2js';
import ProjectType from '../../../types/ProjectType';
import * as E from 'fp-ts/es6/Either';
import * as O from 'fp-ts/es6/Option';
import { pipe } from 'fp-ts/es6/pipeable';
import handleUnknownError from '../../../utils/handleUnknownError';
import { InputTask, Task } from '../../../types/Build';

const getProjectNpm = (): ProjectInfo => {
    const packageJson: PackageJson = require(path.resolve(getCwd(), 'package.json')) as PackageJson;
    return {
        name: packageJson.name.replace('@craigmiller160/', ''),
        version: packageJson.version
    };
};

const parseXml = (xml: string): E.Either<Error, PomXml> =>
    pipe(
        E.tryCatch<Error, E.Either<Error, PomXml>>(
            () => {
                let parsed: O.Option<PomXml> = O.none;
                const parser = new Parser();
                parser.parseString(xml, (error: Error, result: PomXml) => {
                    if (error) {
                        throw error;
                    }
                    parsed = O.some(result);
                });
                return E.fromOption<Error>(
                    () => new Error('Parsed pom.xml should not be null')
                )(parsed);
            },
            handleUnknownError
        ),
        E.flatten
    );

const getProjectMaven = (): E.Either<Error, ProjectInfo> =>
    pipe(
        E.tryCatch(
            () => fs.readFileSync(path.resolve(getCwd(), 'pom.xml'), 'utf8'),
            handleUnknownError
        ),
        E.chain((pomXml: string) => parseXml(pomXml)),
        E.map((parsedPomXml) => ({
            name: parsedPomXml.project.artifactId[0],
            version: parsedPomXml.project.version[0]
        }))
    );

const getProjectInfo: InputTask<ProjectType, ProjectInfo> = (projectType: ProjectType) => {
    switch (projectType) {
        case ProjectType.NpmApplication:
        case ProjectType.NpmLibrary:
            return E.right(getProjectNpm());
        case ProjectType.MavenLibrary:
        case ProjectType.MavenApplication:
            return getProjectMaven();
        default:
            return E.left(new Error()); // TODO enhance this
    }
};

export default getProjectInfo;
