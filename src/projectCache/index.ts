import * as O from 'fp-ts/Option';
import { ProjectType } from '../context/ProjectType';

let project: O.Option<object> = O.none;

export const getRawProjectData = <T extends object>(projectType: ProjectType): T => {

};