import ProjectInfo from '../../../src/types/ProjectInfo';
import ProjectType from '../../../src/types/ProjectType';
import {
    executeIfApplication, executeIfDeployOnlyBuild,
    executeIfLibrary,
    executeIfMavenProject,
    executeIfNotDeployOnlyBuild,
    executeIfNpmProject,
    executeIfPreRelease,
    executeIfRelease,
} from '../../../src/common/execution/commonTaskConditions';
import {DEPLOY_ONLY_BUILD} from '../../../src/execution/executionConstants';

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

    describe('executeIfPreRelease', () => {
        it('is release', () => {
            expect(executeIfPreRelease(baseProjectInfo))
                .toEqual({
                    message: 'Project is not pre-release version',
                    defaultResult: baseProjectInfo
                });
        });

        it('is pre-release', () => {
            const projectInfo: ProjectInfo = {
                ...baseProjectInfo,
                version: '1.0.0-beta',
                isPreRelease: true
            };
            expect(executeIfPreRelease(projectInfo))
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

    describe('executeIfLibrary', () => {
        it('is library', () => {
            expect(executeIfLibrary(baseProjectInfo))
                .toBeUndefined();
        });

        it('is not library', () => {
            const projectInfo: ProjectInfo = {
                ...baseProjectInfo,
                projectType: ProjectType.NpmApplication
            };
            expect(executeIfLibrary(projectInfo))
                .toEqual({
                    message: 'Project is not library',
                    defaultResult: projectInfo
                });
        });
    });

    describe('executeIfMavenProject', () => {
        it('is npm project', () => {
            expect(executeIfMavenProject(baseProjectInfo))
                .toEqual({
                    message: 'Project is not Maven project',
                    defaultResult: baseProjectInfo
                });
        });

        it('is maven project', () => {
            const projectInfo: ProjectInfo = {
                ...baseProjectInfo,
                projectType: ProjectType.MavenApplication
            };
            expect(executeIfMavenProject(projectInfo))
                .toBeUndefined();
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
        it('is deploy only build', () => {
            process.env.BUILD_NAME = DEPLOY_ONLY_BUILD;
            expect(executeIfNotDeployOnlyBuild(baseProjectInfo))
                .toEqual({
                    message: 'Is deploy-only build',
                    defaultResult: baseProjectInfo
                });
        });

        it('is not deploy only build', () => {
            process.env.BUILD_NAME = 'abc';
            expect(executeIfNotDeployOnlyBuild(baseProjectInfo))
                .toEqual(undefined);
        });
    });

    describe('executeIfDeployOnlyBuild', () => {
        it('is deploy only build', () => {
            process.env.BUILD_NAME = DEPLOY_ONLY_BUILD;
            expect(executeIfDeployOnlyBuild(baseProjectInfo))
                .toBeUndefined();
        });

        it('is not deploy only build', () => {
            expect(executeIfDeployOnlyBuild(baseProjectInfo))
                .toEqual({
                    message: 'Not deploy-only build',
                    defaultResult: baseProjectInfo
                });
        });
    });

    describe('executeIfNotDocker', () => {
        it('is docker', () => {
            throw new Error();
        });

        it('is not docker', () => {
            throw new Error();
        });
    });
});
