import path from 'path';
import getCwd from '../../../../src/utils/getCwd';
import ProjectInfo from '../../../../src/types/ProjectInfo';
import ProjectType from '../../../../src/types/ProjectType';
import kubeDeploy, { APPLY_CONFIGMAP, APPLY_DEPLOYMENT } from '../../../../src/stages/deploy/tasks/kubeDeploy';
import '@relmify/jest-fp-ts';
import runCommand from '../../../../src/utils/runCommand';
import * as E from 'fp-ts/Either';

const configmapPath = path.resolve(process.cwd(), 'test', '__working-dirs__', 'npmReleaseApplication');
const noConfigmapPath = path.resolve(process.cwd(), 'test', '__working-dirs__', 'mavenReleaseApplication');

const getCwdMock = getCwd as jest.Mock;
const runCommandMock = runCommand as jest.Mock;

const projectInfo: ProjectInfo = {
    projectType: ProjectType.NpmApplication,
    name: 'my-project',
    version: '1.0.0',
    dependencies: [],
    isPreRelease: false
};

describe('kubeDeploy task', () => {
    it('deploys with configmap', async () => {
        getCwdMock.mockImplementation(() => configmapPath);
        runCommandMock.mockImplementation(() => E.right(''));

        const result = await kubeDeploy(projectInfo)();
        expect(result).toEqualRight(projectInfo);

        expect(runCommandMock).toHaveBeenCalledTimes(2);
        expect(runCommandMock).toHaveBeenNthCalledWith(
            1,
            APPLY_CONFIGMAP,
            {
                cwd: path.resolve(configmapPath, 'deploy'),
                logOutput: true
            }
        );
        expect(runCommandMock).toHaveBeenNthCalledWith(
            2,
            APPLY_DEPLOYMENT,
            {
                cwd: path.resolve(configmapPath, 'deploy'),
                logOutput: true
            }
        );
    });

    it('deploys without configmap', async () => {
        getCwdMock.mockImplementation(() => noConfigmapPath);
        runCommandMock.mockImplementation(() => E.right(''));

        const result = await kubeDeploy(projectInfo)();
        expect(result).toEqualRight(projectInfo);

        expect(runCommandMock).toHaveBeenCalledTimes(1);
        expect(runCommandMock).toHaveBeenNthCalledWith(
            1,
            APPLY_DEPLOYMENT,
            {
                cwd: path.resolve(noConfigmapPath, 'deploy'),
                logOutput: true
            }
        );
    });
});
