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
import { pipe } from 'fp-ts/es6/pipeable';

const getProjectNpm = (): ProjectInfo => {
    const packageJson: PackageJson = require(path.resolve(getCwd(), 'package.json')) as PackageJson;
    return {
        name: packageJson.name.replace('@craigmiller160/', ''),
        version: packageJson.version
    };
};

const parseXml = (xml: string): E.Either<Error, PomXml> => {
    let parsed: PomXml | null = null;
    const parser = new Parser();
    parser.parseString(xml, (error: Error, result: PomXml) => {
        if (error) {
            throw error;
        }
        parsed = result;
    });
    if (parsed !== null) {
        return E.right(parsed);
    }
    return E.left(new Error('Parsed pom.xml should not be null'));
};

const getProjectMaven = (): E.Either<Error, ProjectInfo> => {
    const pomXml = fs.readFileSync(path.resolve(getCwd(), 'pom.xml'), 'utf8');
    return pipe(
        parseXml(pomXml),
        E.map((parsedPomXml) => ({
            name: parsedPomXml.project.artifactId[0],
            version: parsedPomXml.project.version[0]
        }))
    );
};

const getProjectInfo = (projectType: ProjectType): E.Either<Error, ProjectInfo> => {
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
