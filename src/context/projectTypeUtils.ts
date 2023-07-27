import { ProjectType } from './ProjectType';
import { function as func, predicate } from 'fp-ts';

export const isMaven: predicate.Predicate<ProjectType> = (projectType) =>
	[ProjectType.MavenApplication, ProjectType.MavenLibrary].includes(
		projectType
	);

export const isNpm: predicate.Predicate<ProjectType> = (projectType) =>
	[ProjectType.NpmApplication, ProjectType.NpmLibrary].includes(projectType);

export const isDocker: predicate.Predicate<ProjectType> = (projectType) =>
	[ProjectType.DockerApplication, ProjectType.DockerImage].includes(
		projectType
	);

export const isGradle: predicate.Predicate<ProjectType> = (projectType) =>
	[ProjectType.GradleApplication, ProjectType.GradleLibrary].includes(
		projectType
	);

export const isHelm: predicate.Predicate<ProjectType> = (projectType) =>
	[ProjectType.HelmApplication, ProjectType.HelmLibrary].includes(
		projectType
	);

export const isJvm: predicate.Predicate<ProjectType> = func.pipe(
	isMaven,
	predicate.or(isGradle)
);

export const isApplication: predicate.Predicate<ProjectType> = (projectType) =>
	[
		ProjectType.DockerApplication,
		ProjectType.MavenApplication,
		ProjectType.NpmApplication,
		ProjectType.GradleApplication,
		ProjectType.HelmApplication
	].includes(projectType);
