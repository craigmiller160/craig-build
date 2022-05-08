import { getCwdMock } from '../../testutils/getCwdMock';
import path from 'path';
import { parseGradleAst } from '../../../src/ast/gradleKotlin';
import '@relmify/jest-fp-ts';

const emptyChild = (name: string) => ({
	name,
	properties: {},
	variables: {},
	children: [],
	functions: []
});

// TODO now need to do interpolation of variable references

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
				'gradleKotlinReleaseApplication'
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
			variables: {
				springBootWeb: '1.0'
			},
			children: [
				{
					name: 'plugins',
					properties: {},
					variables: {},
					functions: [
						{
							name: 'id',
							args: ['org.springframework.boot']
						},
						{
							name: 'id',
							args: ['io.spring.dependency-management']
						}
					],
					children: []
				},
				{
					name: 'java',
					properties: {
						sourceCompatibility: 'JavaVersion.VERSION_17',
						targetCompatibility: 'JavaVersion.VERSION_17'
					},
					variables: {},
					functions: [],
					children: []
				},
				{
					name: 'repositories',
					properties: {},
					variables: {},
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
					variables: {
						springBootWeb: '1.0',
						springTest: '2.0'
					},
					functions: [
						{
							name: 'implementation',
							args: [
								'org.springframework.boot:spring-boot-starter-web:$springBootWeb'
							]
						},
						{
							name: 'testImplementation',
							args: [
								'org.springframework.boot:spring-boot-starter-test:$springTest'
							]
						}
					],
					children: []
				},
				{
					name: 'tasks',
					properties: {},
					variables: {
						springBootWeb: '1.0'
					},
					functions: [],
					children: [
						{
							...emptyChild('named("test")'),
							variables: {
								springBootWeb: '1.0'
							}
						}
					]
				}
			]
		});
	});
});
