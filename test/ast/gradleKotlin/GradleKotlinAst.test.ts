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
			sectionName: '',
			rootProperties: [
				{
					key: 'rootProject.name',
					value: 'pring-gradle-playground'
				},
				{
					key: 'rootProject.buildFileName',
					value: 'foobar'
				},
				{
					key: 'group',
					value: 'io.craigmiller160'
				},
				{
					key: 'version',
					value: '1.0.0'
				}
			]
		});
	});
});
