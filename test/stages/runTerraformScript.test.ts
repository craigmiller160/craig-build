import { getCwdMock } from '../testutils/getCwdMock';
import { runCommandMock } from '../testutils/runCommandMock';
import path from 'path';
import { baseWorkingDir } from '../testutils/baseWorkingDir';
import { BuildContext } from '../../src/context/BuildContext';
import { createBuildContext } from '../testutils/createBuildContext';
import { ProjectType } from '../../src/context/ProjectType';
import { runTerraformScript } from '../../src/stages/runTerraformScript';
import '@relmify/jest-fp-ts';
import { readUserInput } from '../../src/utils/readUserInput';
import { task, taskEither } from 'fp-ts';
import shellEnv from 'shell-env';

// The no changes line includes the hidden characters that will show up when testing the output
const NO_CHANGES_OUTPUT = `
data.keycloak_realm.apps_prod: Reading...
data.keycloak_realm.apps_dev: Reading...
data.keycloak_realm.apps_dev: Read complete after 0s [id=apps-dev]
keycloak_openid_client.expense_tracker_ui_dev: Refreshing state... [id=7ba71e16-28cf-4568-9ea1-819781bdf85e]
data.keycloak_realm.apps_prod: Read complete after 0s [id=apps-prod]
keycloak_openid_client.expense_tracker_ui_prod: Refreshing state... [id=302c0308-9523-43cf-aa23-d5dbb055bd17]

\x1B[0m\x1B[1m\x1B[32mNo changes.\x1B[0m\x1B[1m Your infrastructure matches the configuration.\x1B[0m

Terraform has compared your real infrastructure against your configuration
and found no differences, so no changes are needed.
`;

const HAS_CHANGES_OUTPUT = `
data.keycloak_realm.apps_prod: Reading...
data.keycloak_realm.apps_dev: Read complete after 0s [id=apps-dev]
keycloak_openid_client.expense_tracker_ui_dev: Refreshing state... [id=7ba71e16-28cf-4568-9ea1-819781bdf85e]
data.keycloak_realm.apps_prod: Read complete after 0s [id=apps-prod]
keycloak_openid_client.expense_tracker_ui_prod: Refreshing state... [id=302c0308-9523-43cf-aa23-d5dbb055bd17]

Terraform used the selected providers to generate the following execution
plan. Resource actions are indicated with the following symbols:
  ~ update in-place

Terraform will perform the following actions:

  # keycloak_openid_client.expense_tracker_ui_prod will be updated in-place
  ~ resource "keycloak_openid_client" "expense_tracker_ui_prod" {
        id                                         = "302c0308-9523-43cf-aa23-d5dbb055bd17"
        name                                       = "expense-tracker-ui"
      ~ valid_post_logout_redirect_uris            = [
          - "https://apps.craigmiller160.us/expense-tracker/*",
          + "https://apps.craigmiller160.us/expense-tracker/*2",
        ]
        # (22 unchanged attributes hidden)
    }

Plan: 0 to add, 1 to change, 0 to destroy.

─────────────────────────────────────────────────────────────────────────────

Note: You didn't use the -out option to save this plan, so Terraform can't
guarantee to take exactly these actions if you run "terraform apply" now.
`;

vi.mock('../../src/utils/readUserInput', () => ({
	readUserInput: vi.fn()
}));
const readUserInputMock = readUserInput as vi.Mock;

vi.mock('shell-env', () => ({
	sync: vi.fn()
}));
const shellEnvMock = shellEnv.sync as vi.Mock;
const prepareEnvMock = () =>
	shellEnvMock.mockImplementation(() => ({
		NEXUS_USER: 'user',
		NEXUS_PASSWORD: 'password'
	}));

describe('runTerraformScript', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('executes the terraform script', async () => {
		const workingDir = path.join(
			baseWorkingDir,
			'mavenReleaseApplicationWithTerraform'
		);
		getCwdMock.mockImplementation(() => workingDir);
		readUserInputMock.mockImplementation(() => task.of('y'));
		runCommandMock.mockImplementation(() =>
			taskEither.right(HAS_CHANGES_OUTPUT)
		);
		const buildContext: BuildContext = {
			...createBuildContext(),
			projectType: ProjectType.MavenApplication,
			hasTerraform: true
		};

		const result = await runTerraformScript.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(readUserInputMock).toHaveBeenCalledTimes(1);
		expect(readUserInputMock).toHaveBeenNthCalledWith(
			1,
			'Do you want to execute the terraform script? (y/n): '
		);

		expect(runCommandMock).toHaveBeenCalledTimes(2);
		expect(runCommandMock).toHaveBeenNthCalledWith(1, 'terraform plan ', {
			printOutput: true,
			cwd: path.join(workingDir, 'deploy', 'terraform')
		});
		expect(runCommandMock).toHaveBeenNthCalledWith(
			2,
			'terraform apply -auto-approve ',
			{
				printOutput: true,
				cwd: path.join(workingDir, 'deploy', 'terraform')
			}
		);
	});

	it('skips terraform execution if user chooses', async () => {
		const workingDir = path.join(
			baseWorkingDir,
			'mavenReleaseApplicationWithTerraform'
		);
		getCwdMock.mockImplementation(() => workingDir);
		readUserInputMock.mockImplementation(() => 'n');
		runCommandMock.mockImplementation(() =>
			taskEither.right(HAS_CHANGES_OUTPUT)
		);
		const buildContext: BuildContext = {
			...createBuildContext(),
			projectType: ProjectType.MavenApplication,
			hasTerraform: true
		};

		const result = await runTerraformScript.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(readUserInputMock).toHaveBeenCalledTimes(1);
		expect(readUserInputMock).toHaveBeenNthCalledWith(
			1,
			'Do you want to execute the terraform script? (y/n): '
		);

		expect(runCommandMock).toHaveBeenCalledTimes(1);
		expect(runCommandMock).toHaveBeenNthCalledWith(1, 'terraform plan ', {
			printOutput: true,
			cwd: path.join(workingDir, 'deploy', 'terraform')
		});
	});

	it('executes the terraform script with secret variables', async () => {
		prepareEnvMock();
		const workingDir = path.join(
			baseWorkingDir,
			'mavenReleaseApplicationWithTerraformAndSecrets'
		);
		getCwdMock.mockImplementation(() => workingDir);
		readUserInputMock.mockImplementation(() => task.of('y'));
		runCommandMock.mockImplementation(() =>
			taskEither.right(HAS_CHANGES_OUTPUT)
		);
		const buildContext: BuildContext = {
			...createBuildContext(),
			projectType: ProjectType.MavenApplication,
			hasTerraform: true
		};

		const result = await runTerraformScript.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(readUserInputMock).toHaveBeenCalledTimes(1);
		expect(readUserInputMock).toHaveBeenNthCalledWith(
			1,
			'Do you want to execute the terraform script? (y/n): '
		);

		expect(runCommandMock).toHaveBeenCalledTimes(2);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			1,
			'terraform plan -var=variable_one=$THE_VALUE',
			{
				printOutput: true,
				cwd: path.join(workingDir, 'deploy', 'terraform'),
				env: expect.any(Object)
			}
		);
		expect(runCommandMock).toHaveBeenNthCalledWith(
			2,
			'terraform apply -auto-approve -var=variable_one=$THE_VALUE',
			{
				printOutput: true,
				cwd: path.join(workingDir, 'deploy', 'terraform'),
				env: expect.any(Object)
			}
		);
	});

	it('executes terraform script with no changes to apply', async () => {
		prepareEnvMock();
		const workingDir = path.join(
			baseWorkingDir,
			'mavenReleaseApplicationWithTerraform'
		);
		getCwdMock.mockImplementation(() => workingDir);
		readUserInputMock.mockImplementation(() => task.of('y'));
		runCommandMock.mockImplementation(() =>
			taskEither.right(NO_CHANGES_OUTPUT)
		);
		const buildContext: BuildContext = {
			...createBuildContext(),
			projectType: ProjectType.MavenApplication,
			hasTerraform: true
		};

		const result = await runTerraformScript.execute(buildContext)();
		expect(result).toEqualRight(buildContext);

		expect(readUserInputMock).toHaveBeenCalledTimes(0);

		expect(runCommandMock).toHaveBeenCalledTimes(1);
		expect(runCommandMock).toHaveBeenNthCalledWith(1, 'terraform plan ', {
			printOutput: true,
			cwd: path.join(workingDir, 'deploy', 'terraform'),
			env: expect.any(Object)
		});
	});
});
