module.exports = {
	parserOptions: {
		ecmaVersion: '2020'
	},
	env: {
		browser: true,
		amd: true,
		node: true,
		es6: true
	},
	extends: ['eslint:recommended', 'plugin:prettier/recommended'],
	overrides: [
		{
			files: ['**/*.ts?(x)'],
			parser: '@typescript-eslint/parser',
			extends: ['plugin:@typescript-eslint/recommended']
		}
	],
	rules: {
		'prettier/prettier': ['error', {}, { usePrettierrc: true }],
		'no-console': ['error']
	}
};
