
export const TASK_NAME = 'Deploy';

const DOCKER_REPO = 'craigmiller160.ddns.net:30004';
export const APPLY_CONFIGMAP = 'kubectl apply -f configmap.yml';
export const APPLY_DEPLOYMENT = 'kubectl apply -f deployment.yml';

const createDockerLogin = (userName: string, password: string) =>
    `sudo docker login ${DOCKER_REPO} -u ${userName} -p ${password}`;
const createDockerBuild = (tag: string) =>
    `sudo docker build --network=host -t ${tag} .`;
const createDockerPush = (tag: string) =>
    `sudo docker push ${tag}`;

// TODO need to be able to change CWD in runCommand

export default {};
