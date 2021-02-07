import ProjectInfo from '../../../src/types/ProjectInfo';
import ProjectType from '../../../src/types/ProjectType';
import { executeIfApplication, executeIfRelease } from '../../../src/common/execution/commonTaskConditions';

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
            throw new Error();
        });

        it('is npm release', () => {
            throw new Error();
        });

        it('is maven pre-release', () => {
            throw new Error();
        });
    });
});