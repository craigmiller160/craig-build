import { ProjectType } from './ProjectType';
import * as P from 'fp-ts/Predicate';

export const isMaven: P.Predicate<ProjectType> = (projectType) =>
	[
		ProjectType.MavenApplication,
		ProjectType.MavenLibrary,
		ProjectType.GradleKotlinLibrary
	].includes(projectType);

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

export const isApplication: P.Predicate<ProjectType> = (projectType) =>
	[
		ProjectType.DockerApplication,
		ProjectType.MavenApplication,
		ProjectType.NpmApplication,
		ProjectType.GradleKotlinApplication
	].includes(projectType);
