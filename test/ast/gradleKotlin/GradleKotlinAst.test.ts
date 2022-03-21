import { getCwdMock } from '../../testutils/getCwdMock';
import path from 'path';
import { parseGradleAst } from '../../../src/ast/gradleKotlin';
import '@relmify/jest-fp-ts';

const emptyChild = (name: string) => ({
	name,
	properties: {},
	children: [],
	functions: []
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
			functions: [],
			children: [
				emptyChild('plugins'),
				{
					name: 'java',
					properties: {
						sourceCompatibility: 'JavaVersion.VERSION_17',
						targetCompatibility: 'JavaVersion.VERSION_17'
					},
					functions: [],
					children: []
				},
				{
					name: 'repositories',
					properties: {},
					functions: [
						{
							name: 'mavenCentral',
							args: []
						}
					],
					children: []
				},
				{
					name: 'dependencies',
					properties: {},
					functions: [
						{
							name: 'implementation',
							args: [
								'org.springframework.boot:spring-boot-starter-web'
							]
						},
						{
							name: 'testImplementation',
							args: [
								'org.springframework.boot:spring-boot-starter-test'
							]
						}
					],
					children: []
				},
				{
					name: 'tasks',
					properties: {},
					functions: [],
					children: [emptyChild('named("test")')]
				}
			]
		});
	});
});
