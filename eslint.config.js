const path = require('path');

const config = {
    extends: [
        'airbnb'
    ],
    parser: 'babel-eslint',
    env: {
        browser: true,
        commonjs: true,
        es6: true,
        jest: true,
        node: true,
    },
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        }
    },
    settings: {
        react: {
            version: 'detect',
        }
    },
    rules: {
        'no-tabs': 0,
        'react/jsx-indent': 0,
        'indent': 0,
        'react/jsx-filename-extension': 0,
        'array-callback-return': 0,
        'no-console': [
            'error',
            {
                allow: ['error']
            }
        ],
        'react/jsx-curly-spacing': [ 2, { 'when': 'always', allowMultiline: false } ],
        'react/jsx-indent-props': 0,
        'no-trailing-spaces': 0,
        'comma-dangle': ['error', 'never'],
        'react/jsx-props-no-spreading': 0,
        'no-plusplus': 0,
        'import/no-extraneous-dependencies': 0,
        'operator-linebreak': ['error', 'after'],
        'object-curly-newline': ['error', { consistent: true }],
        'max-len': [
            'error',
            {
                code: 120,
                ignoreComments: true
            }
        ],
        'implicit-arrow-linebreak': 0,
        'object-curly-spacing': ['error', 'always'],
        'array-bracket-spacing': ['error', 'always'],
        'react/require-default-props': 0,
        'no-param-reassign': [
            'error',
            {
                props: true,
                ignorePropertyModificationsFor: [
                    'draft'
                ]
            }
        ],
        'react/destructuring-assignment': 0,
        'import/prefer-default-export': 0,
        'react/jsx-wrap-multilines': [
            'error',
            {
                declaration: 'parens',
                assignment: 'parens',
                'return': 'parens',
                arrow: 'parens',
                condition: 'ignore',
                logical: 'ignore',
                prop: 'parens'
            }
        ]
    },
    globals: {
        window: true,
        document: true,
        isNaN: true,
        requestAnimationFrame: true,
        localStorage: true,
        sessionStorage: true,
        fetch: true,
        customElements: true,
        HTMLElement: true
    },
    overrides: [
        {
            files: ['**/*.ts?(x)'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true,
                },
                warnOnUnsupportedTypeScriptVersion: true,
            },
            settings: {
                'import/resolver': {
                    typescript: {
                        project: path.resolve(process.cwd(), 'tsconfig.json')
                    }
                }
            },
            plugins: ['@typescript-eslint'],
            rules: {
                // TypeScript's `noFallthroughCasesInSwitch` option is more robust (#6906)
                'default-case': 'off',
                // 'tsc' already handles this (https://github.com/typescript-eslint/typescript-eslint/issues/291)
                'no-dupe-class-members': 'off',
                // 'tsc' already handles this (https://github.com/typescript-eslint/typescript-eslint/issues/477)
                'no-undef': 'off',
                '@typescript-eslint/consistent-type-assertions': 'error',
                '@typescript-eslint/no-use-before-define': 'error',
                'no-array-constructor': 'off',
                '@typescript-eslint/no-array-constructor': 'error',
                'no-use-before-define': 'off',
                'no-unused-expressions': 'off',
                '@typescript-eslint/no-unused-expressions': [
                    'error',
                    {
                        allowShortCircuit: true,
                        allowTernary: true,
                        allowTaggedTemplates: true,
                    },
                ],
                'no-unused-vars': 'off',
                '@typescript-eslint/no-unused-vars': [
                    'error',
                    {
                        args: 'none',
                        ignoreRestSiblings: true,
                    },
                ],
                'no-useless-constructor': 'off',
                '@typescript-eslint/no-useless-constructor': 'error',
                'import/extensions': [
                    'error',
                    {
                        ts: 'never',
                        tsx: 'never'
                    }
                ],
                'no-empty-function': 0,
                '@typescript-eslint/no-empty-function': 'error',
                'semi': 0,
                '@typescript-eslint/semi': ['error', 'always'],
                '@typescript-eslint/member-delimiter-style': [
                    'error',
                    {
                        multiline: {
                            delimiter: 'semi',
                            requireLast: true
                        },
                        singleline: {
                            delimiter: 'semi',
                            requireLast: true
                        }
                    }
                ]
            }
        }
    ]
};

module.exports = config;
