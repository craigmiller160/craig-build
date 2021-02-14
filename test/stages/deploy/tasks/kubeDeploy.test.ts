import fs from 'fs';
import path from 'path';

const configmapPath = path.resolve(process.cwd(), 'test', '__working-dirs__', 'npmReleaseApplication');
const noConfigmapPath = path.resolve(process.cwd(), 'test', '__working-dirs__', 'mavenReleaseApplication');

describe('kubeDeploy task', () => {
    it('deploys with configmap', () => {
        throw new Error();
    });

    it('deploys without configmap', () => {
        throw new Error();
    });
});
