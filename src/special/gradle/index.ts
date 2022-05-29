import { GRADLE_TOOL_FILE } from '../../installConstants';
import * as E from 'fp-ts/Either';

interface GradleItem {
	readonly group: string;
	readonly name: string;
	readonly version: string;
}

export interface GradleProject {
	readonly info: GradleItem;
	readonly dependencies: ReadonlyArray<GradleItem>;
}

export const readGradleProject = (
	projectDirectory: string
): E.Either<Error, GradleProject> => {};
