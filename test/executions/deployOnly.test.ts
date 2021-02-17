import '@relmify/jest-fp-ts';
import identify from '../../src/stages/identify';
import configValidation from '../../src/stages/config-validation';
import deploy from '../../src/stages/deploy';
import { buildLogger } from '../../src/common/logger';
import ProjectInfo from '../../src/types/ProjectInfo';
import ProjectType from '../../src/types/ProjectType';
import * as TE from 'fp-ts/TaskEither';
import deployOnly from '../../src/execution/deployOnly';
import BuildError from '../../src/error/BuildError';

jest.mock('../../src/stages/identify', () => jest.fn());
jest.mock('../../src/stages/config-validation', () => jest.fn());
jest.mock('../../src/stages/deploy', () => jest.fn());
jest.mock('../../src/common/logger', () => {
    const logger = jest.requireActual('../../src/common/logger');
    return {
        ...logger,
        buildLogger: jest.fn()
    }
});

const identifyMock = identify as jest.Mock;
const configValidationMock = configValidation as jest.Mock;
const deployMock = deploy as jest.Mock;
const buildLoggerMock = buildLogger as jest.Mock;

const projectInfo: ProjectInfo = {
    projectType: ProjectType.NpmApplication,
    name: 'my-project',
    version: '1.0.0',
    dependencies: [],
    isPreRelease: false
};

describe('deployOnly', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('runs successfully', async () => {
        identifyMock.mockImplementation(() => TE.right(projectInfo));
        configValidationMock.mockImplementation(() => TE.right(projectInfo));
        deployMock.mockImplementation(() => TE.right(projectInfo));

        const result = await deployOnly()();
        expect(result).toEqualRight(projectInfo);

        expect(buildLogger).toHaveBeenCalledTimes(2);
        expect(buildLogger).toHaveBeenNthCalledWith(1, 'Deploying only undefined');
        expect(buildLogger).toHaveBeenNthCalledWith(2, 'Deploy only finished successfully', 'success');

        expect(identifyMock).toHaveBeenCalledWith(undefined);
        expect(configValidationMock).toHaveBeenCalledWith(projectInfo);
        expect(deployMock).toHaveBeenCalledWith(projectInfo);
    });

    it('logs build error', async () => {
        const buildError = new BuildError('Error', 'TheStage', 'TheTask');
        identifyMock.mockImplementation(() => TE.left(buildError));

        const result = await deployOnly()();
        expect(result).toEqualLeft(buildError);

        expect(buildLogger).toHaveBeenCalledTimes(2);
        expect(buildLogger).toHaveBeenNthCalledWith(1, 'Deploying only undefined');
        expect(buildLogger).toHaveBeenNthCalledWith(2, 'Deploy only failed on Stage TheStage and Task TheTask: Error', 'error');

        expect(identifyMock).toHaveBeenCalledWith(undefined);
        expect(configValidationMock).not.toHaveBeenCalled();
        expect(deployMock).not.toHaveBeenCalled();
    });

    it('logs other error', async () => {
        const error = new Error('Error');
        identifyMock.mockImplementation(() => TE.left(error));

        const result = await deployOnly()();
        expect(result).toEqualLeft(error);

        expect(buildLogger).toHaveBeenCalledTimes(2);
        expect(buildLogger).toHaveBeenNthCalledWith(1, 'Deploying only undefined');
        expect(buildLogger).toHaveBeenNthCalledWith(2, 'Deploy Only Error: Error', 'error');

        expect(identifyMock).toHaveBeenCalledWith(undefined);
        expect(configValidationMock).not.toHaveBeenCalled();
        expect(deployMock).not.toHaveBeenCalled();
    });
});