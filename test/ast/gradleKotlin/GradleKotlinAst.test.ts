import { getCwdMock } from '../../testutils/getCwdMock';
import path from 'path';
import { parseGradleAst } from '../../../src/ast/gradleKotlin';
import '@relmify/jest-fp-ts';

const emptyChild = (name: string) => ({
	name,
	properties: {},
	children: []
});

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
			name: 'ROOT',
			properties: {
				'rootProject.name': 'spring-gradle-playground',
				'rootProject.buildFileName': 'foobar',
				group: 'io.craigmiller160',
				version: '1.0.0'
			},
			children: [
				emptyChild('plugins'),
				{
					name: 'java',
					properties: {
						sourceCompatibility: 'JavaVersion.VERSION_17',
						targetCompatibility: 'JavaVersion.VERSION_17'
					},
					children: []
				},
				emptyChild('repositories'),
				emptyChild('dependencies'),
				{
					name: 'tasks',
					properties: {},
					children: [emptyChild('named("test")')]
				}
			]
		});
	});
});
