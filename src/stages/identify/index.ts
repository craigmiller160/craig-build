import identifyProject from './tasks/identifyProject';
import getProjectConfig from './tasks/getProjectInfo';
import * as E from 'fp-ts/es6/Either';
import { pipe } from 'fp-ts/es6/pipeable';
import ProjectInfo from '../../types/ProjectInfo';
import { Stage } from '../../types/Build';
import { stageLogger } from '../../context/logger';

const STAGE_NAME = 'Identify';

const identify: Stage<undefined, ProjectInfo> = () => {
    stageLogger(STAGE_NAME, 'Starting...');
    return pipe(
        identifyProject(),
        E.map((projectType) => getProjectConfig(projectType)),
        E.flatten,
        E.map((projectInfo) => {
            stageLogger(STAGE_NAME, 'Finished successfully');
            return projectInfo;
        })
    );
};

export default identify;
