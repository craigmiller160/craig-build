import { ProjectInfo } from './ProjectInfo';
import * as P from 'fp-ts/Predicate';
import { VersionType } from './VersionType';

export const isRelease: P.Predicate<ProjectInfo> = (projectInfo) =>
	VersionType.Release === projectInfo.versionType;

export const isPreRelease: P.Predicate<ProjectInfo> = (projectInfo) =>
	VersionType.PreRelease === projectInfo.versionType;
