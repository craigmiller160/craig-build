import ProjectInfo from '../../../../src/types/ProjectInfo';
import ProjectType from '../../../../src/types/ProjectType';
import validateDependencyVersions, { TASK_NAME } from '../../../../src/stages/config-validation/tasks/validateDependencyVersions';
import '@relmify/jest-fp-ts';
import BuildError from '../../../../src/error/BuildError';
import { STAGE_NAME } from '../../../../src/stages/config-validation';

describe('validateDependencyVersions task', () => {
    it('validates maven for release, with snapshot dependency', () => {
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
        const result = validateDependencyVersions(projectInfo);
        const expectedMessage = 'SNAPSHOT dependencies not allowed in release build: io.craigmiller160/dep-1:1.0.0-SNAPSHOT ';
        expect(result).toEqualLeft(new BuildError(expectedMessage, {
            taskName: TASK_NAME,
            stageName: STAGE_NAME
        }));
    });

    it('validates maven for release successfully', () => {
        throw new Error();
    });

    it('validates maven for snapshot, with snapshot dependency', () => {
        throw new Error();
    });

    it('validates npm for release, with beta dependency', () => {
        throw new Error();
    });

    it('validates npm for release successfully', () => {
        throw new Error();
    });

    it('validates npm for beta, with beta dependency', () => {
        throw new Error();
    });
});