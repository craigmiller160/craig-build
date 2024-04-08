import { vi, MockedFunction } from 'vitest';
import {
	readGradleProject,
	CreateReadGradleProjectType
} from '../../src/special/gradle';
import { RunCommandType } from '../../src/command/runCommand';

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
