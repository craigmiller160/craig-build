import path from 'path';
import fs from 'fs';

const REGEX = /^fullBuild(?<name>_.*_*.\.ts$)/;

const files = fs.readdirSync(__dirname);
const buildFiles = files.filter((file) => REGEX.test(file));
const filePairs = buildFiles.map((file) => {
	const fullSrc = path.join(__dirname, file);
	const groups = REGEX.exec(file)?.groups as any;
    const fullTarget = path.join(__dirname, `kubernetesOnly${groups.name}`);
    return [fullSrc, fullTarget]
});
filePairs.forEach(([src, target]) => {
    fs.copyFileSync(src, target);
})
