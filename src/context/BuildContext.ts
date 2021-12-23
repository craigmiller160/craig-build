import { CommandInfo } from './CommandInfo';
import { BuildToolInfo } from './BuildToolInfo';
import { ProjectType } from './ProjectType';
import { ProjectInfo } from './ProjectInfo';
import { IncompleteBuildContext } from './IncompleteBuildContext';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';

type Container2 = [CommandInfo, BuildToolInfo];
type Container3 = [CommandInfo, BuildToolInfo, ProjectType];
type Container4 = [CommandInfo, BuildToolInfo, ProjectType, ProjectInfo];

export interface BuildContext {
	commandInfo: CommandInfo;
	buildToolInfo: BuildToolInfo;
	projectType: ProjectType;
	projectInfo: ProjectInfo;
}

export const fromIncompleteContext = (
	context: IncompleteBuildContext
): E.Either<Error, BuildContext> =>
	pipe(
		context.commandInfo,
		O.chain((commandInfo) =>
			pipe(
				context.buildToolInfo,
				O.map(
					(buildToolInfo): Container2 => [commandInfo, buildToolInfo]
				)
			)
		),
		O.chain(([commandInfo, buildToolInfo]) =>
			pipe(
				context.projectType,
				O.map(
					(projectType): Container3 => [
						commandInfo,
						buildToolInfo,
						projectType
					]
				)
			)
		),
		O.chain(([commandInfo, buildToolInfo, projectType]) =>
			pipe(
				context.projectInfo,
				O.map(
					(projectInfo): Container4 => [
						commandInfo,
						buildToolInfo,
						projectType,
						projectInfo
					]
				)
			)
		),
		O.map(
			([
				commandInfo,
				buildToolInfo,
				projectType,
				projectInfo
			]): BuildContext => ({
				commandInfo,
				buildToolInfo,
				projectType,
				projectInfo
			})
		),
		E.fromOption(() => new Error('IncompleteBuildContext has not yet been completed'))
	);
