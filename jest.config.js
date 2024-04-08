/* eslint-disable */
const path = require('path');

module.exports = {
	bail: false,
	collectCoverage: false,
	testEnvironment: 'node',
	roots: [process.cwd()],
	modulePaths: [path.resolve(process.cwd(), 'src')],
	testMatch: [path.resolve(process.cwd(), 'test/**/*.test.{js,jsx,ts,tsx}')],
	// setupFilesAfterEnv: [path.resolve(process.cwd(), 'test', 'setup.ts')],
	modulePathIgnorePatterns: [path.resolve(process.cwd(), '.yalc')],
	transform: {
		'^.+\\.tsx?$': '@swc/jest'
	},
	setupFilesAfterEnv: [
		path.join(process.cwd(), 'test', 'setup.ts')
	]
	// reporters: [
	// 	['jest-summarizing-reporter', { diffs: true }]
	// ]
};
