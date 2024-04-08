import { vi, MockedFunction } from 'vitest';
import { readGradleProject } from '../../src/special/gradle';
import { runCommand } from '../../src/command/runCommand';
import { createReadGradleProject } from '../../src/special/gradle';

type RunCommandType = typeof runCommand;
type CreateReadGradleProjectType = typeof createReadGradleProject;

vi.mock('../../src/special/gradle', async () => {
	const { createReadGradleProject } = await vi.importActual<{
		createReadGradleProject: CreateReadGradleProjectType;
	}>('../../src/special/gradle');
	const { runCommand } = await vi.importActual<{
		runCommand: RunCommandType;
	}>('../../src/command/runCommand');
	return {
		readGradleProject: createReadGradleProject(runCommand)
	};
});

export const readGradleProjectMock = readGradleProject as MockedFunction<
	typeof readGradleProject
>;
