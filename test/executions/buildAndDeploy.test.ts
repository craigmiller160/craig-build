import '@relmify/jest-fp-ts';
import selfValidation from '../../src/stages/self-validation';
import identify from '../../src/stages/identify';
import configValidation from '../../src/stages/config-validation';
import createArtifact from '../../src/stages/createArtifact';
import deploy from '../../src/stages/deploy';
import cleanup from '../../src/stages/cleanup';
import { buildLogger } from '../../src/common/logger';
import ProjectInfo from '../../src/types/ProjectInfo';
import ProjectType from '../../src/types/ProjectType';
import * as TE from 'fp-ts/TaskEither';
import buildAndDeploy from '../../src/execution/buildAndDeploy';
import BuildError from '../../src/error/BuildError';

jest.mock('../../src/stages/identify', () => jest.fn());
jest.mock('../../src/stages/config-validation', () => jest.fn());
jest.mock('../../src/stages/createArtifact', () => jest.fn());
jest.mock('../../src/stages/deploy', () => jest.fn());
jest.mock('../../src/stages/cleanup', () => jest.fn());
jest.mock('../../src/stages/self-validation', () => jest.fn());
jest.mock('../../src/common/logger', () => {
    const logger = jest.requireActual('../../src/common/logger');
    return {
        ...logger,
        buildLogger: jest.fn()
    }
});

const selfValidationMock = selfValidation as jest.Mock;
const identifyMock = identify as jest.Mock;
const configValidationMock = configValidation as jest.Mock;
const createArtifactMock = createArtifact as jest.Mock;
const deployMock = deploy as jest.Mock;
const cleanupMock = cleanup as jest.Mock;
const buildLoggerMock = buildLogger as jest.Mock;

const projectInfo: ProjectInfo = {
    projectType: ProjectType.NpmApplication,
    name: 'my-project',
    version: '1.0.0',
    dependencies: [],
    isPreRelease: false
};

describe('buildAndDeploy', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('runs successfully', async () => {
        selfValidationMock.mockImplementation(() => TE.right('')); // TODO review this type
        identifyMock.mockImplementation(() => TE.right(projectInfo));
        configValidationMock.mockImplementation(() => TE.right(projectInfo));
        createArtifactMock.mockImplementation(() => TE.right(projectInfo));
        deployMock.mockImplementation(() => TE.right(projectInfo));
        cleanupMock.mockImplementation(() => TE.right(projectInfo));

        const result = await buildAndDeploy()();
        expect(result).toEqualRight(projectInfo);

        expect(buildLogger).toHaveBeenCalledTimes(2);
        expect(buildLogger).toHaveBeenNthCalledWith(1, 'Building and deploying undefined');
        expect(buildLogger).toHaveBeenNthCalledWith(2, 'Build and deploy finished successfully', 'success');

        expect(selfValidationMock).toHaveBeenCalledWith(null); // TODO review this argument
        expect(identifyMock).toHaveBeenCalledWith(undefined);
        expect(configValidationMock).toHaveBeenCalledWith(projectInfo);
        expect(createArtifactMock).toHaveBeenCalledWith(projectInfo);
        expect(deployMock).toHaveBeenCalledWith(projectInfo);
        expect(cleanupMock).toHaveBeenCalledWith(projectInfo);
    });

    it('logs build error', async () => {
        const buildError = new BuildError('Error', 'TheStage', 'TheTask');
        selfValidationMock.mockImplementation(() => TE.right('')); // TODO review this type
        identifyMock.mockImplementation(() => TE.right(projectInfo));
        configValidationMock.mockImplementation(() => TE.right(projectInfo));
        createArtifactMock.mockImplementation(() => TE.left(buildError));

        const result = await buildAndDeploy()();
        expect(result).toEqualLeft(buildError);

        expect(buildLogger).toHaveBeenCalledTimes(2);
        expect(buildLogger).toHaveBeenNthCalledWith(1, 'Building and deploying undefined');
        expect(buildLogger).toHaveBeenNthCalledWith(2, 'Build and deploy failed on Stage TheStage and Task TheTask: Error', 'error');

        expect(selfValidationMock).toHaveBeenCalledWith(null); // TODO review this argument
        expect(identifyMock).toHaveBeenCalledWith(undefined);
        expect(configValidationMock).toHaveBeenCalledWith(projectInfo);
        expect(createArtifactMock).toHaveBeenCalledWith(projectInfo);
        expect(deployMock).not.toHaveBeenCalled();
        expect(cleanupMock).not.toHaveBeenCalled();
    });

    it('logs other error', async () => {
        const error = new Error('Error');
        selfValidationMock.mockImplementation(() => TE.right('')); // TODO review this type
        identifyMock.mockImplementation(() => TE.right(projectInfo));
        configValidationMock.mockImplementation(() => TE.right(projectInfo));
        createArtifactMock.mockImplementation(() => TE.left(error));

        const result = await buildAndDeploy()();
        expect(result).toEqualLeft(error);

        expect(buildLogger).toHaveBeenCalledTimes(2);
        expect(buildLogger).toHaveBeenNthCalledWith(1, 'Building and deploying undefined');
        expect(buildLogger).toHaveBeenNthCalledWith(2, 'Build and Deploy Error: Error', 'error');

        expect(selfValidationMock).toHaveBeenCalledWith(null); // TODO review this argument
        expect(identifyMock).toHaveBeenCalledWith(undefined);
        expect(configValidationMock).toHaveBeenCalledWith(projectInfo);
        expect(createArtifactMock).toHaveBeenCalledWith(projectInfo);
        expect(deployMock).not.toHaveBeenCalled();
        expect(cleanupMock).not.toHaveBeenCalled();
    });
});