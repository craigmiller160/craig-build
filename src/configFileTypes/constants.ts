import path from 'path';

export const NPM_PROJECT_FILE = 'package.json';
export const MAVEN_PROJECT_FILE = 'pom.xml';
export const DOCKER_PROJECT_FILE = 'docker.json';
export const DEPLOY_DIRECTORY = 'deploy';
export const KUBERNETES_DEPLOY_FILE = path.resolve(
	DEPLOY_DIRECTORY,
	'deployment.yml'
);
export const DOCKER_REPO_PREFIX = 'craigmiller160.ddns.net:30004';
export const IMAGE_VERSION_ENV = '${KUBE_IMG_VERSION}';
