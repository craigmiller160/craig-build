import '@relmify/jest-fp-ts';
import getSelfProjectInfo from '../../../../old-src/stages/self-validation/tasks/getSelfProjectInfo';
import ProjectType from '../../../../old-src/types/ProjectType';
import PackageJson from '../../../../old-src/types/PackageJson';
import fs from 'fs';
import path from 'path';

const packageJson: PackageJson = JSON.parse(
	fs.readFileSync(
		path.resolve(__dirname, '..', '..', '..', '..', 'package.json'),
		'utf8'
	)
);

describe('getSelfProjectInfo task', () => {
	it('gets info successfully', async () => {
		const result = await getSelfProjectInfo(undefined)();
		expect(result).toEqualRight({
			projectType: ProjectType.NpmApplication,
			group: 'craigmiller160',
			name: 'craig-build',
			version: packageJson.version,
			dependencies: [],
			isPreRelease: packageJson.version.includes('beta')
		});
	});
});
