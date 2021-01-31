// TODO add retrieval of dependency versions here

import path from 'path';
import ProjectInfo, { Dependency } from '../../../types/ProjectInfo';
import PackageJson, { Dependencies as NpmDependencies } from '../../../types/PackageJson';
import getCwd from '../../../utils/getCwd';
import fs from 'fs';
import PomXml from '../../../types/PomXml';
import { Parser } from 'xml2js';
import ProjectType from '../../../types/ProjectType';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/pipeable';
import handleUnknownError from '../../../utils/handleUnknownError';
import { InputTask } from '../../../types/Build';
import BuildError from '../../../error/BuildError';
import { SUCCESS_STATUS, taskLogger } from '../../../context/logger';
import { STAGE_NAME } from '../index';

const TASK_NAME = 'Get Base Project Info';

type KeyValueMap = {
    [key: string]: string;
}

const mapNpmDependencies = (dependencies: NpmDependencies) =>
    Object.entries(dependencies)
        .map(([key, value]) => ({
            name: key,
            version: value
        }));

const getProjectNpm = (projectType: ProjectType): ProjectInfo => {
    const packageJson: PackageJson = require(path.resolve(getCwd(), 'package.json')) as PackageJson;
    return {
        projectType,
        name: packageJson.name.replace('@craigmiller160/', ''),
        version: packageJson.version,
        dependencies: [
            ...mapNpmDependencies(packageJson.dependencies),
            ...mapNpmDependencies(packageJson.devDependencies)
        ],
        isPreRelease: packageJson.version.includes('beta')
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

const getMavenDependencies = (pomXml: PomXml): Dependency[] => {
    const propertyMap: KeyValueMap = Object.entries(pomXml.project.properties[0])
        .reduce((acc: KeyValueMap, [key, value]) => {
            acc[key] = value[0];
            return acc;
        }, {});
    return pomXml.project.dependencies[0].dependency
        .map((dependency) => {
            let version = dependency.version?.[0] ?? '';
            if (version.startsWith('${')) {
                const mapKey = version.replace(/^\${/, '')
                    .replace(/}$/, '');
                version = propertyMap[mapKey];
            }
            return {
                name: `${dependency.groupId[0]}/${dependency.artifactId[0]}`,
                version
            };
        });
};

const getProjectMaven = (projectType: ProjectType): E.Either<Error, ProjectInfo> =>
    pipe(
        E.tryCatch(
            () => fs.readFileSync(path.resolve(getCwd(), 'pom.xml'), 'utf8'),
            handleUnknownError
        ),
        E.chain((pomXml: string) => parseXml(pomXml)),
        E.map((parsedPomXml) => {
            const version = parsedPomXml.project.version[0];
            return {
                projectType,
                name: parsedPomXml.project.artifactId[0],
                version,
                dependencies: getMavenDependencies(parsedPomXml),
                isPreRelease: version.includes('SNAPSHOT')
            };
        })
    );

const findProjectInfo = (projectType: ProjectType): E.Either<Error, ProjectInfo> => {
    switch (projectType) {
        case ProjectType.NpmApplication:
        case ProjectType.NpmLibrary:
            return E.right(getProjectNpm(projectType));
        case ProjectType.MavenLibrary:
        case ProjectType.MavenApplication:
            return getProjectMaven(projectType);
        default:
            return E.left(new BuildError('Cannot find or load project info', { taskName: TASK_NAME }));
    }
};

const getBaseProjectInfo: InputTask<ProjectType, ProjectInfo> = (projectType: ProjectType) => {
    taskLogger(STAGE_NAME, TASK_NAME, 'Starting...');
    return pipe(
        findProjectInfo(projectType),
        E.map((projectInfo) => {
            taskLogger(STAGE_NAME, TASK_NAME, 'Finished loading base ProjectInfo successfully', SUCCESS_STATUS);
            return projectInfo;
        })
    );
};

export default getBaseProjectInfo;
