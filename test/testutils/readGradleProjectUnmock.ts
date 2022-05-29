import { readGradleProject } from '../../src/special/gradle';

jest.mock('../../src/special/gradle', () => {
	const { createReadGradleProject } = jest.requireActual(
		'../../src/special/gradle'
	);
	const { runCommand } = jest.requireActual('../../src/command/runCommand');
	return {
		readGradleProject: createReadGradleProject(runCommand)
	};
});

export const readGradleProjectUnmock = readGradleProject as jest.Mock;
