import ProjectInfo from '../../../src/types/ProjectInfo';
import ProjectType from '../../../src/types/ProjectType';
import {
    executeIfApplication,
    executeIfNotDeployOnlyBuild,
    executeIfNpmProject,
    executeIfRelease,
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
    beforeEach(() => {
        process.env.BUILD_NAME = undefined;
    });

    afterEach(() => {
        process.env.BUILD_NAME = undefined;
    });

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
            throw new Error();
        });

        it('is pre-release', () => {
            throw new Error();
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
            throw new Error();
        });

        it('is not library', () => {
            throw new Error();
        });
    });

    describe('executeIfMavenProject', () => {
        it('is npm project', () => {
            throw new Error();
        });

        it('is maven project', () => {
            throw new Error();
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

    describe('executeIfDeployOnlyBuild', () => {
        it('is deploy only build', () => {
            throw new Error();
        });

        it('is not deploy only build', () => {
            throw new Error();
        });
    });
});
