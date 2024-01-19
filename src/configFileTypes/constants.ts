import path from 'path';

export const NPM_PROJECT_FILE = 'package.json';
export const MAVEN_PROJECT_FILE = 'pom.xml';
export const DOCKER_PROJECT_FILE = 'docker.json';
export const HELM_PROJECT_FILE = 'helm.json';
export const GRADLE_KOTLIN_PROJECT_FILE = 'build.gradle.kts';
export const GRADLE_GROOVY_PROJECT_FILE = 'build.gradle';
export const DEPLOY_DIRECTORY = 'deploy';
export const TERRAFORM_DIRECTORY = 'terraform';
export const KUBERNETES_DEPLOY_FILE = path.join(
	DEPLOY_DIRECTORY,
	'deployment.yml'
);
export const HELM_DEPLOY_FILE = path.join(
	DEPLOY_DIRECTORY,
	'chart',
	'Chart.yaml'
);
export const TERRAFORM_DEPLOY_PATH = path.join(
	DEPLOY_DIRECTORY,
	TERRAFORM_DIRECTORY
);
export const TERRAFORM_JSON_PATH = path.join(
	TERRAFORM_DEPLOY_PATH,
	'terraform.json'
);
export const DOCKER_REPO_PREFIX = 'nexus-docker.craigmiller160.us';
export const IMAGE_VERSION_ENV = '${KUBE_IMG_VERSION}';
