import { ProjectInfo } from './ProjectInfo';
import { predicate } from 'fp-ts';
import { VersionType } from './VersionType';

export const isRelease: predicate.Predicate<ProjectInfo> = (projectInfo) =>
	VersionType.Release === projectInfo.versionType;

export const isPreRelease: predicate.Predicate<ProjectInfo> = (projectInfo) =>
	VersionType.PreRelease === projectInfo.versionType;
