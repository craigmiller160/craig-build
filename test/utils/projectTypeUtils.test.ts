import { isApplication, isLibrary, isMaven, isNpm } from '../../src/utils/projectTypeUtils';
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

    it('isMaven', () => {
        expect(isMaven(ProjectType.MavenApplication))
            .toEqual(true);
        expect(isMaven(ProjectType.NpmApplication))
            .toEqual(false);
        expect(isMaven(ProjectType.MavenLibrary))
            .toEqual(true);
        expect(isMaven(ProjectType.NpmLibrary))
            .toEqual(false);
    });

    it('isNpm', () => {
        expect(isNpm(ProjectType.MavenApplication))
            .toEqual(false);
        expect(isNpm(ProjectType.NpmApplication))
            .toEqual(true);
        expect(isNpm(ProjectType.MavenLibrary))
            .toEqual(false);
        expect(isNpm(ProjectType.NpmLibrary))
            .toEqual(true);
    });
});