import { GRADLE_TOOL_FILE } from '../../installConstants';
import { taskEither } from 'fp-ts';
import { runCommand } from '../../command/runCommand';
import { function as func } from 'fp-ts';
import { parseJson } from '../../functions/Json';

export interface GradleItem {
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

type RunCommandType = typeof runCommand;

export const createReadGradleProject =
	(doRunCommand: RunCommandType) =>
	(projectDirectory: string): TE.TaskEither<Error, GradleProject> =>
		pipe(
			doRunCommand(createCommand(projectDirectory)),
			TE.chainEitherK((_) => parseJson<GradleProject>(_))
		);

export const readGradleProject = createReadGradleProject(runCommand);
