import '@relmify/jest-fp-ts';
import ProjectInfo from '../../../../src/types/ProjectInfo';
import ProjectType from '../../../../src/types/ProjectType';
import validateKubeVersion, { TASK_NAME } from '../../../../src/stages/config-validation/tasks/validateKubeVersion';
import BuildError from '../../../../src/error/BuildError';
import { STAGE_NAME } from '../../../../src/stages/config-validation';

describe('validateKubeVersion task', () => {
    it('valid pre-release kubernetes version', () => {
        const projectInfo: ProjectInfo = {
            projectType: ProjectType.NpmLibrary,
            name: 'my-project',
            version: '1.0.0-beta',
            isPreRelease: true,
            dependencies: [],
            kubernetesDockerImage: 'localhost:30000/my-project:latest'
        };
        const result = validateKubeVersion(projectInfo);
        expect(result).toEqualRight(projectInfo);
    });

    it('invalid pre-release kubernetes version', () => {
        const projectInfo: ProjectInfo = {
            projectType: ProjectType.NpmLibrary,
            name: 'my-project',
            version: '1.0.0-beta',
            isPreRelease: true,
            dependencies: [],
            kubernetesDockerImage: 'localhost:30000/my-project:1.0.0-beta'
        };
        const result = validateKubeVersion(projectInfo);
        const message = 'Invalid Kubernetes Version. Project Version: 1.0.0-beta Kubernetes Image: localhost:30000/my-project:1.0.0-beta';
        expect(result).toEqualLeft(new BuildError(message, {
            taskName: TASK_NAME,
            stageName: STAGE_NAME
        }));
    });

    it('valid release kubernetes version', () => {
        const projectInfo: ProjectInfo = {
            projectType: ProjectType.NpmLibrary,
            name: 'my-project',
            version: '1.0.0',
            isPreRelease: false,
            dependencies: [],
            kubernetesDockerImage: 'localhost:30000/my-project:1.0.0'
        };
        const result = validateKubeVersion(projectInfo);
        expect(result).toEqualRight(projectInfo);
    });

    it('invalid release kubernetes version', () => {
        const projectInfo: ProjectInfo = {
            projectType: ProjectType.NpmLibrary,
            name: 'my-project',
            version: '1.0.0',
            isPreRelease: false,
            dependencies: [],
            kubernetesDockerImage: 'localhost:30000/my-project:1.0.1'
        };
        const result = validateKubeVersion(projectInfo);
        const message = 'Invalid Kubernetes Version. Project Version: 1.0.0 Kubernetes Image: localhost:30000/my-project:1.0.1';
        expect(result).toEqualLeft(new BuildError(message, {
            taskName: TASK_NAME,
            stageName: STAGE_NAME
        }));
    });
});