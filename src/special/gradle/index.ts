import { GRADLE_TOOL_FILE } from '../../installConstants';
import * as TE from 'fp-ts/TaskEither';
import { runCommand } from '../../command/runCommand';
import { pipe } from 'fp-ts/function';
import { parseJson } from '../../functions/Json';

interface GradleItem {
	readonly group: string;
	readonly name: string;
	readonly version: string;
}

export interface GradleProject {
	readonly info: GradleItem;
	readonly dependencies: ReadonlyArray<GradleItem>;
}

const createCommand = (projectDirectory: string): string =>
	`java -jar ${GRADLE_TOOL_FILE} ${projectDirectory}`;

export const readGradleProject = (
	projectDirectory: string
): TE.TaskEither<Error, GradleProject> =>
	pipe(
		runCommand(createCommand(projectDirectory)),
		TE.chainEitherK((_) => parseJson<GradleProject>(_))
	);
