import identifyProject from './tasks/identifyProject';
import getProjectConfig from './tasks/getProjectInfo';
import * as E from 'fp-ts/es6/Either';
import { pipe } from 'fp-ts/es6/pipeable';
import ProjectInfo from '../../types/ProjectInfo';
import { Stage } from '../../types/Build';
import { stageLogger } from '../../context/logger';

const STAGE_NAME = 'Identify';

const identify: Stage<ProjectInfo> = () => {
    stageLogger(STAGE_NAME, 'Starting...');
    return pipe(
        identifyProject(),
        E.chain((projectType) => getProjectConfig(projectType)),
        E.map((projectInfo) => {
            stageLogger(STAGE_NAME, 'Finished successfully');
            return projectInfo;
        })
    );
};

export default identify;
