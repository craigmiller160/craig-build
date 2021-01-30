import ProjectType from './ProjectType';
import BuildSystem from './BuildSystem';

export default interface ProjectDescription {
    projectType?: ProjectType;
    buildSystem?: BuildSystem;
}