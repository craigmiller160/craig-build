const path = require('path');

module.exports = {
    preset: 'ts-jest',
    bail: false,
    testEnvironment: 'node',
    roots: [
        process.cwd()
    ],
    modulePaths: [
        path.resolve(process.cwd(), 'src')
    ],
    testMatch: [
        path.resolve(process.cwd(), 'test/**/*.test.{js,jsx,ts,tsx}')
    ],
    setupFilesAfterEnv: [
        path.resolve(process.cwd(), 'test', 'setup.ts')
    ],
    modulePathIgnorePatterns: [
        path.resolve(process.cwd(), '.yalc')
    ],
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    }
};