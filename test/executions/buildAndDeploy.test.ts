import '@relmify/jest-fp-ts';
import identify from '../../src/stages/identify';
import configValidation from '../../src/stages/config-validation';
import createArtifact from '../../src/stages/createArtifact';
import deploy from '../../src/stages/deploy';
import cleanup from '../../src/stages/cleanup';
import { buildLogger } from '../../src/common/logger';

jest.mock('../../src/stages/identify', () => jest.fn());
jest.mock('../../src/stages/config-validation', () => jest.fn());
jest.mock('../../src/stages/createArtifact', () => jest.fn());
jest.mock('../../src/stages/deploy', () => jest.fn());
jest.mock('../../src/stages/cleanup', () => jest.fn());
jest.mock('../../src/common/logger', () => jest.fn());

const identifyMock = identify as jest.Mock;
const configValidationMock = configValidation as jest.Mock;
const createArtifactMock = createArtifact as jest.Mock;
const deployMock = deploy as jest.Mock;
const cleanupMock = cleanup as jest.Mock;
const buildLoggerMock = buildLogger as jest.Mock;

describe('buildAndDeploy', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('runs successfully', () => {
        throw new Error();
    });

    it('logs error', () => {
        throw new Error();
    });
});