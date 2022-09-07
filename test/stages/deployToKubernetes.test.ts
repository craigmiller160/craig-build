import { getCwdMock } from '../testutils/getCwdMock';
import { runCommandMock } from '../testutils/runCommandMock';
import { createBuildContext } from '../testutils/createBuildContext';
import {
	deployToKubernetes,
	K8S_CTX,
	K8S_NS
} from '../../src/stages/deployToKubernetes';
import '@relmify/jest-fp-ts';
import * as TE from 'fp-ts/TaskEither';
import { VersionType } from '../../src/context/VersionType';
import { BuildContext } from '../../src/context/BuildContext';
import { baseWorkingDir } from '../testutils/baseWorkingDir';
import { ProjectType } from '../../src/context/ProjectType';
import path from 'path';

const createHelmList = (deploymentName: string): string => `
NAME            NAMESPACE       REVISION        UPDATED                                 STATUS          CHART                   APP VERSION
${deploymentName}   apps-prod       1               2022-09-06 16:30:04.728675 -0400 EDT    deployed        email-service-0.1.0     1.0.0      
ingress         apps-prod       1               2022-09-05 17:01:57.090562 -0400 EDT    deployed        ingress-0.1.0           1.0.0
`;

const baseBuildContext = createBuildContext({
	projectInfo: {
		group: 'craigmiller160',
		name: 'my-project',
		version: '1.0.0',
		versionType: VersionType.Release
	}
});

describe('deployToKubernetes', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('installs new application via helm', async () => {
		const baseCwd = path.join(baseWorkingDir, 'mavenReleaseApplication');
		getCwdMock.mockImplementation(() => baseCwd);
		const buildContext: BuildContext = {
			...baseBuildContext,
			projectType: ProjectType.MavenApplication
		};

		const deploymentName = 'email-service';

		runCommandMock.mockImplementationOnce(() =>
			TE.right(createHelmList(deploymentName))
		);
		runCommandMock.mockImplementation(() => TE.right(''));

		const result = await deployToKubernetes.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(runCommandMock).toHaveBeenCalledTimes(6);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			1,
			`helm list --kube-context=${K8S_CTX} --namespace ${K8S_NS}`,
			{ printOutput: true }
		);
	});

	it('upgrades existing application via helm', async () => {
		throw new Error();
	});
});
