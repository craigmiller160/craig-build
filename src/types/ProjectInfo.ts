import ProjectType from './ProjectType';

interface Dependency {
    name: string;
    version: string;
}

export default interface ProjectInfo {
    projectType: ProjectType;
    name: string;
    version: string;
    dependencies: Dependency[];
    kubernetesDockerImage?: string;
    latestNexusVersion?: string;
}
