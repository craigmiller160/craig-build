import { ProjectType } from './ProjectType';
import * as P from 'fp-ts/Predicate';
import { function as func } from 'fp-ts';

export const isMaven: P.Predicate<ProjectType> = (projectType) =>
	[ProjectType.MavenApplication, ProjectType.MavenLibrary].includes(
		projectType
	);

export const isNpm: P.Predicate<ProjectType> = (projectType) =>
	[ProjectType.NpmApplication, ProjectType.NpmLibrary].includes(projectType);

export const isDocker: P.Predicate<ProjectType> = (projectType) =>
	[ProjectType.DockerApplication, ProjectType.DockerImage].includes(
		projectType
	);

export const isGradle: P.Predicate<ProjectType> = (projectType) =>
	[ProjectType.GradleApplication, ProjectType.GradleLibrary].includes(
		projectType
	);

export const isHelm: P.Predicate<ProjectType> = (projectType) =>
	[ProjectType.HelmApplication, ProjectType.HelmLibrary].includes(
		projectType
	);

export const isJvm: P.Predicate<ProjectType> = pipe(isMaven, P.or(isGradle));

export const isApplication: P.Predicate<ProjectType> = (projectType) =>
	[
		ProjectType.DockerApplication,
		ProjectType.MavenApplication,
		ProjectType.NpmApplication,
		ProjectType.GradleApplication,
		ProjectType.HelmApplication
	].includes(projectType);
