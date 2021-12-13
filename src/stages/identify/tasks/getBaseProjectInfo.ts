import path from 'path';
import ProjectInfo, {Dependency} from '../../../types/ProjectInfo';
import PackageJson, {Dependencies as NpmDependencies} from '../../../types/PackageJson';
import getCwd from '../../../utils/getCwd';
import fs from 'fs';
import PomXml from '../../../types/PomXml';
import {Parser} from 'xml2js';
import ProjectType from '../../../types/ProjectType';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import {pipe} from 'fp-ts/function';
import handleUnknownError from '../../../utils/handleUnknownError';
import createTask, {TaskFunction} from '../../../common/execution/task';
import {TaskContext} from '../../../common/execution/context';
import stageName from '../stageName';
import DockerJson from "../../../types/DockerJson";
import {separateGroupAndName} from '../../../utils/separateGroupAndName';

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
    if (!pomXml.project.dependencies || pomXml.project.dependencies.length === 0) {
        return [];
    }

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
                group: parsedPomXml.project.groupId[0],
                name: parsedPomXml.project.artifactId[0],
                version,
                dependencies: getMavenDependencies(parsedPomXml),
                isPreRelease: version.includes('SNAPSHOT')
            };
        })
    );

const getProjectNpm = (projectType: ProjectType): ProjectInfo => {
    const packageJson: PackageJson = require(path.resolve(getCwd(), 'package.json')) as PackageJson;
    const [group, name] = separateGroupAndName(packageJson.name);
    return {
        projectType,
        group,
        name,
        version: packageJson.version,
        dependencies: [
            ...(packageJson.dependencies ? mapNpmDependencies(packageJson.dependencies) : []),
            ...(packageJson.devDependencies ? mapNpmDependencies(packageJson.devDependencies) : [])
        ],
        isPreRelease: packageJson.version.includes('beta')
    };
};

const getProjectDocker = (projectType: ProjectType): ProjectInfo => {
    const dockerJson: DockerJson = require(path.resolve(getCwd(), 'docker.json')) as DockerJson;
    const [group, name] = separateGroupAndName(dockerJson.name);
    return {
        projectType,
        group,
        name,
        version: dockerJson.version,
        dependencies: [],
        isPreRelease: dockerJson.version === 'latest'
    };
};

const findProjectInfo = (context: TaskContext<ProjectType>): E.Either<Error, ProjectInfo> => {
    switch (context.input) {
        case ProjectType.NpmApplication:
        case ProjectType.NpmLibrary:
            return E.right(getProjectNpm(context.input));
        case ProjectType.MavenLibrary:
        case ProjectType.MavenApplication:
            return getProjectMaven(context.input);
        case ProjectType.DockerApplication:
        case ProjectType.DockerImage:
            return E.right(getProjectDocker(context.input));
        default:
            return E.left(context.createBuildError('Cannot find or load project info'));
    }
};

const getBaseProjectInfo: TaskFunction<ProjectType,ProjectInfo> = (context: TaskContext<ProjectType>) =>
    pipe(
        findProjectInfo(context),
        E.map((projectInfo) => ({
            message: 'Base ProjectInfo successfully loaded',
            value: projectInfo
        })),
        TE.fromEither
    );

export default createTask(stageName, TASK_NAME, getBaseProjectInfo);
