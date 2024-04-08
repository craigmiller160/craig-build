import { describe, expect, it } from 'vitest';
import { ProjectInfo } from '../../src/context/ProjectInfo';
import { isPreRelease, isRelease } from '../../src/context/projectInfoUtils';
import { VersionType } from '../../src/context/VersionType';

describe('projectInfoUtils', () => {
	it('isRelease', () => {
		const projectInfo: ProjectInfo = {
			name: '',
			group: '',
			version: '',
			versionType: VersionType.Release
		};
		expect(isRelease(projectInfo)).toEqual(true);
		expect(
			isRelease({
				...projectInfo,
				versionType: VersionType.PreRelease
			})
		).toEqual(false);
	});

	it('isPreRelease', () => {
		const projectInfo: ProjectInfo = {
			name: '',
			group: '',
			version: '',
			versionType: VersionType.PreRelease
		};
		expect(isPreRelease(projectInfo)).toEqual(true);
		expect(
			isPreRelease({
				...projectInfo,
				versionType: VersionType.Release
			})
		).toEqual(false);
	});
});
