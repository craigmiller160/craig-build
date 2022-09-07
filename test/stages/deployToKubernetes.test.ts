import { runCommandMock } from '../testutils/runCommandMock';
import { createBuildContext } from '../testutils/createBuildContext';
import { deployToKubernetes } from '../../src/stages/deployToKubernetes';
import '@relmify/jest-fp-ts';
import * as TE from 'fp-ts/TaskEither';
import { VersionType } from '../../src/context/VersionType';

const helmList = `
NAME            NAMESPACE       REVISION        UPDATED                                 STATUS          CHART                   APP VERSION
email-service   apps-prod       1               2022-09-06 16:30:04.728675 -0400 EDT    deployed        email-service-0.1.0     1.0.0      
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
		runCommandMock.mockImplementation(() => TE.right(''));
	});

	it('deploys for application', async () => {
		throw new Error();
	});
});
