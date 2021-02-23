import ProjectInfo from '../../../src/types/ProjectInfo';
import ProjectType from '../../../src/types/ProjectType';
import {
    executeIfApplication, executeIfNotDeployOnlyBuild,
    executeIfNpmPreRelease,
    executeIfNpmProject,
    executeIfRelease
} from '../../../src/common/execution/commonTaskConditions';
import { DEPLOY_ONLY_BUILD } from '../../../src/execution/executionConstants';

const baseProjectInfo: ProjectInfo = {
    projectType: ProjectType.NpmLibrary,
    name: 'my-project',
    version: '1.0.0',
    dependencies: [],
    isPreRelease: false
};

describe('commonTaskConditions', () => {
    describe('executeIfRelease', () => {
        it('is not release', () => {
            const projectInfo: ProjectInfo = {
                ...baseProjectInfo,
                version: '1.0.0-beta',
                isPreRelease: true
            };
            expect(executeIfRelease(projectInfo))
                .toEqual({
                    message: 'Project is not release version',
                    defaultResult: projectInfo
                });
        });

        it('is release', () => {
            expect(executeIfRelease(baseProjectInfo))
                .toBeUndefined();
        });
    });

    describe('executeIfApplication', () => {
        it('is application', () => {
            const projectInfo: ProjectInfo = {
                ...baseProjectInfo,
                projectType: ProjectType.NpmApplication
            };
            expect(executeIfApplication(projectInfo))
                .toBeUndefined();
        });

        it('is not application', () => {
            expect(executeIfApplication(baseProjectInfo))
                .toEqual({
                    message: 'Project is not application',
                    defaultResult: baseProjectInfo
                });
        });
    });

    describe('executeIfNpmPreRelease', () => {
        it('is npm pre-release', () => {
            const projectInfo: ProjectInfo = {
                ...baseProjectInfo,
                version: '1.0.0-beta',
                isPreRelease: true
            };
            expect(executeIfNpmPreRelease(projectInfo))
                .toBeUndefined();
        });

        it('is npm release', () => {
            expect(executeIfNpmPreRelease(baseProjectInfo))
                .toEqual({
                    message: 'Npm project is not pre-release version',
                    defaultResult: baseProjectInfo
                });
        });

        it('is maven pre-release', () => {
            const projectInfo: ProjectInfo = {
                ...baseProjectInfo,
                projectType: ProjectType.MavenLibrary,
                version: '1.0.0-SNAPSHOT',
                isPreRelease: true
            };
            expect(executeIfNpmPreRelease(projectInfo))
                .toEqual({
                    message: 'Project is not Npm project',
                    defaultResult: projectInfo
                });
        });
    });

    describe('executeIfNpmProject', () => {
        it('is npm project', () => {
            expect(executeIfNpmProject(baseProjectInfo))
                .toBeUndefined();
        });

        it('is maven project', () => {
            const projectInfo: ProjectInfo = {
                ...baseProjectInfo,
                projectType: ProjectType.MavenLibrary
            };
            expect(executeIfNpmProject(projectInfo))
                .toEqual({
                    message: 'Project is not Npm project',
                    defaultResult: projectInfo
                });
        });
    });

    describe('executeIfNotDeployOnlyBuild', () => {
        beforeEach(() => {
            process.env.BUILD_NAME = undefined;
        });

        it('is deploy only build', () => {
            process.env.BUILD_NAME = DEPLOY_ONLY_BUILD;
            expect(executeIfNotDeployOnlyBuild(baseProjectInfo))
                .toEqual({
                    message: 'Not running for deploy only build',
                    defaultResult: baseProjectInfo
                });
        });

        it('is not deploy only build', () => {
            process.env.BUILD_NAME = 'abc';
            expect(executeIfNotDeployOnlyBuild(baseProjectInfo))
                .toEqual(undefined);
        });
    });

    describe('executeIfReleaseAndNotDeployOnlyBuild', () => {
        it('is release and not deploy only', () => {
            throw new Error();
        });

        it('is release and deploy only', () => {
            throw new Error();
        });

        it('is not release and not deploy only', () => {
            throw new Error();
        });
    });
});