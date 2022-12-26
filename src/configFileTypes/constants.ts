import path from 'path';

export const NPM_PROJECT_FILE = 'package.json';
export const MAVEN_PROJECT_FILE = 'pom.xml';
export const DOCKER_PROJECT_FILE = 'docker.json';
export const HELM_PROJECT_FILE = 'helm.json';
export const DEPLOY_DIRECTORY = 'deploy';
export const KUBERNETES_DEPLOY_FILE = path.join(
	DEPLOY_DIRECTORY,
	'deployment.yml'
);
export const DOCKER_REPO_PREFIX = 'nexus-docker-craigmiller160.ddns.net';
export const IMAGE_VERSION_ENV = '${KUBE_IMG_VERSION}';
