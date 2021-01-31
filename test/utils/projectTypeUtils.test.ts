import { isApplication, isLibrary } from '../../src/utils/projectTypeUtils';
import ProjectType from '../../src/types/ProjectType';

describe('projectTypeUtils', () => {
    it('isApplication', () => {
        expect(isApplication(ProjectType.MavenApplication))
            .toEqual(true);
        expect(isApplication(ProjectType.NpmApplication))
            .toEqual(true);
        expect(isApplication(ProjectType.MavenLibrary))
            .toEqual(false);
        expect(isApplication(ProjectType.NpmLibrary))
            .toEqual(false);
    });

    it('isLibrary', () => {
        expect(isLibrary(ProjectType.MavenApplication))
            .toEqual(false);
        expect(isLibrary(ProjectType.NpmApplication))
            .toEqual(false);
        expect(isLibrary(ProjectType.MavenLibrary))
            .toEqual(true);
        expect(isLibrary(ProjectType.NpmLibrary))
            .toEqual(true);
    });
});