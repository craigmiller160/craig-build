import ProjectType from '../types/ProjectType';

export const isApplication = (projectType: ProjectType) =>
  ProjectType.MavenApplication === projectType ||
    ProjectType.NpmApplication === projectType ||
    ProjectType.DockerApplication === projectType;

export const isLibrary = (projectType: ProjectType) =>
  ProjectType.MavenLibrary === projectType ||
    ProjectType.NpmLibrary === projectType;

export const isMaven = (projectType: ProjectType) =>
  ProjectType.MavenLibrary === projectType ||
    ProjectType.MavenApplication === projectType;

export const isNpm = (projectType: ProjectType) =>
  ProjectType.NpmLibrary === projectType ||
    ProjectType.NpmApplication === projectType;

export const isDocker = (projectType: ProjectType) =>
  ProjectType.DockerApplication === projectType ||
    ProjectType.DockerImage === projectType;
