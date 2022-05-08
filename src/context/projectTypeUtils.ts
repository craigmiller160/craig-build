import { ProjectType } from './ProjectType';
import * as P from 'fp-ts/Predicate';
import { pipe } from 'fp-ts/function';

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

export const isGradleKotlin: P.Predicate<ProjectType> = (projectType) =>
	[
		ProjectType.GradleKotlinApplication,
		ProjectType.GradleKotlinLibrary
	].includes(projectType);

export const isJvm: P.Predicate<ProjectType> = pipe(
	isMaven,
	P.and(isGradleKotlin)
);

export const isApplication: P.Predicate<ProjectType> = (projectType) =>
	[
		ProjectType.DockerApplication,
		ProjectType.MavenApplication,
		ProjectType.NpmApplication,
		ProjectType.GradleKotlinApplication
	].includes(projectType);
