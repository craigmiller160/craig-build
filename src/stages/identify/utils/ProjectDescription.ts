import ProjectType from './ProjectType';
import BuildSystem from './BuildSystem';

export default interface ProjectDescription {
    isDeploy: boolean;
    controlFile?: string;
}