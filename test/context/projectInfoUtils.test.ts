import { ProjectInfo } from '../../src/context/ProjectInfo';
import { isPreRelease, isRelease } from '../../src/context/projectInfoUtils';

describe('projectInfoUtils', () => {
	it('isRelease', () => {
		const projectInfo: ProjectInfo = {
			name: '',
			group: '',
			version: '',
			isPreRelease: false
		};
		expect(isRelease(projectInfo)).toEqual(true);
		expect(
			isRelease({
				...projectInfo,
				isPreRelease: true
			})
		).toEqual(false);
	});

	it('isPreRelease', () => {
		const projectInfo: ProjectInfo = {
			name: '',
			group: '',
			version: '',
			isPreRelease: true
		};
		expect(isPreRelease(projectInfo)).toEqual(true);
		expect(
			isPreRelease({
				...projectInfo,
				isPreRelease: false
			})
		).toEqual(false);
	});
});
