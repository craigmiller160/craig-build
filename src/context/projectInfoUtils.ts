import { ProjectInfo } from './ProjectInfo';
import * as P from 'fp-ts/Predicate';

export const isRelease: P.Predicate<ProjectInfo> = (projectInfo) =>
	!projectInfo.isPreRelease;

export const isPreRelease: P.Predicate<ProjectInfo> = (projectInfo) =>
	projectInfo.isPreRelease;
