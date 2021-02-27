import ProjectInfo from '../../../../src/types/ProjectInfo';
import ProjectType from '../../../../src/types/ProjectType';
import validateDependencyVersions, { TASK_NAME } from '../../../../src/stages/config-validation/tasks/validateDependencyVersions';
import '@relmify/jest-fp-ts';
import BuildError from '../../../../src/error/BuildError';
import stageName from '../../../../src/stages/config-validation/stageName';
import { createTaskLogger } from '../../../../src/common/logger';

jest.mock('../../../../src/common/logger', () => ({
    ...(jest.requireActual('../../../../src/common/logger') as object),
    createTaskLogger: jest.fn()
}));

const createTaskLoggerMock = createTaskLogger as jest.Mock;
const mockLogger = jest.fn();

describe('validateDependencyVersions task', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        createTaskLoggerMock.mockImplementation(() => mockLogger);
    });

    it('validates maven for release, with snapshot dependency', async () => {
        const projectInfo: ProjectInfo = {
            projectType: ProjectType.MavenLibrary,
            isPreRelease: false,
            name: 'my-project',
            version: '1.0.0',
            dependencies: [
                {
                    name: 'foo-bar',
                    version: '1.0.0-SNAPSHOT'
                },
                {
                    name: 'io.craigmiller160/dep-1',
                    version: '1.0.0-SNAPSHOT'
                },
                {
                    name: 'io.craigmiller160/dep-2',
                    version: '1.0.0'
                }
            ]
        };
        const result = await validateDependencyVersions(projectInfo)();
        const expectedMessage = 'SNAPSHOT dependencies not allowed in release build: io.craigmiller160/dep-1:1.0.0-SNAPSHOT ';
        expect(result).toEqualLeft(new BuildError(expectedMessage, TASK_NAME, stageName));
    });

    it('validates maven for release successfully', async () => {
        const projectInfo: ProjectInfo = {
            projectType: ProjectType.MavenLibrary,
            isPreRelease: false,
            name: 'my-project',
            version: '1.0.0',
            dependencies: [
                {
                    name: 'foo-bar',
                    version: '1.0.0-SNAPSHOT'
                },
                {
                    name: 'io.craigmiller160/dep-1',
                    version: '1.0.0'
                },
                {
                    name: 'io.craigmiller160/dep-2',
                    version: '1.0.0'
                }
            ]
        };
        const result = await validateDependencyVersions(projectInfo)();
        expect(result).toEqualRight(projectInfo);
    });

    it('validates npm for release, with beta dependency', async () => {
        const projectInfo: ProjectInfo = {
            projectType: ProjectType.NpmLibrary,
            isPreRelease: false,
            name: 'my-project',
            version: '1.0.0',
            dependencies: [
                {
                    name: 'foo-bar',
                    version: '1.0.0-beta'
                },
                {
                    name: '@craigmiller160/dep-1',
                    version: '1.0.0-beta'
                },
                {
                    name: '@craigmiller160/dep-2',
                    version: '1.0.0'
                }
            ]
        };
        const result = await validateDependencyVersions(projectInfo)();
        const expectedMessage = 'beta dependencies not allowed in release build: @craigmiller160/dep-1:1.0.0-beta ';
        expect(result).toEqualLeft(new BuildError(expectedMessage, TASK_NAME, stageName));
    });

    it('validates npm for release successfully', async () => {
        const projectInfo: ProjectInfo = {
            projectType: ProjectType.NpmLibrary,
            isPreRelease: false,
            name: 'my-project',
            version: '1.0.0',
            dependencies: [
                {
                    name: 'foo-bar',
                    version: '1.0.0-beta'
                },
                {
                    name: '@craigmiller160/dep-1',
                    version: '1.0.0'
                },
                {
                    name: '@craigmiller160/dep-2',
                    version: '1.0.0'
                }
            ]
        };
        const result = await validateDependencyVersions(projectInfo)();
        const expectedMessage = 'beta dependencies not allowed in release build: io.craigmiller160/dep-1:1.0.0-SNAPSHOT ';
        expect(result).toEqualRight(projectInfo);
    });

    describe('skip execution', () => {
        it('is pre-release', async () => {
            const projectInfo: ProjectInfo = {
                projectType: ProjectType.NpmApplication,
                isPreRelease: true,
                name: 'my-project',
                version: '1.0.0-beta',
                dependencies: []
            };
            const result = await validateDependencyVersions(projectInfo)();
            expect(result).toEqualRight(projectInfo);
            expect(mockLogger).toHaveBeenCalledWith('Skipping task Validate Dependency Versions: Project is not release version');
        });

        it('is DockerDeployment', async () => {
            throw new Error();
        });
    });
});