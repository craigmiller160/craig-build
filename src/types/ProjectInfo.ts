import ProjectType from './ProjectType';

export interface Dependency {
  name: string;
  version: string;
}

export interface NexusVersions {
  latestPreReleaseVersion?: string;
  latestReleaseVersion?: string;
}

export default interface ProjectInfo {
  projectType: ProjectType;
  group: string;
  name: string;
  version: string;
  dependencies: Dependency[];
  kubernetesDeploymentName?: string;
  kubernetesDockerImage?: string;
  latestNexusVersions?: NexusVersions;
  isPreRelease: boolean;
  dockerPreReleaseVersion?: string;
}
