import { readGradleProject } from '../../src/special/gradle';

vi.mock('../../src/special/gradle', () => {
	const { createReadGradleProject } = vi.requireActual(
		'../../src/special/gradle'
	);
	const { runCommand } = vi.requireActual('../../src/command/runCommand');
	return {
		readGradleProject: createReadGradleProject(runCommand)
	};
});

export const readGradleProjectUnmock = readGradleProject as vi.Mock;
