import { getCwdMock } from '../../testutils/getCwdMock';
import path from 'path';
import { parseGradleAst } from '../../../src/ast/gradleKotlin';
import '@relmify/jest-fp-ts';

describe('GradleKotlin AST parser', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('parses gradle kotlin config files', () => {
		getCwdMock.mockImplementation(() =>
			path.join(
				process.cwd(),
				'test',
				'__working-dirs__',
				'gradleReleaseApplication'
			)
		);

		const result = parseGradleAst();
		expect(result).toEqualRight({
			currentSectionName: '',
			rootProperties: {
				'rootProject.name': 'spring-gradle-playground',
				'rootProject.buildFileName': 'foobar',
				group: 'io.craigmiller160',
				version: '1.0.0',
				sourceCompatibility: 'JavaVersion.VERSION_17',
				targetCompatibility: 'JavaVersion.VERSION_17'
			}
		});
	});
});
