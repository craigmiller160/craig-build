import { IncompleteBuildContext } from '../../src/context/IncompleteBuildContext';
import * as O from 'fp-ts/Option';
import { CommandType } from '../../src/context/CommandType';
import { ProjectType } from '../../src/context/ProjectType';
import { BuildContext } from '../../src/context/BuildContext';
import {LoggableBuildContext} from '../../src/context/LoggableBuildContext';

const incompleteContext: IncompleteBuildContext = {
	commandInfo: O.some({
		type: CommandType.FULL_BUILD
	}),
	buildToolInfo: O.some({
		group: '',
		name: '',
		version: '',
		isPreRelease: false
	}),
	projectType: O.some(ProjectType.DockerApplication),
	projectInfo: O.none
};

const loggableIncompleteContext: LoggableBuildContext = {
	commandInfo: {
		type: CommandType.FULL_BUILD
	},
	buildToolInfo: {
		group: '',
		name: '',
		version: '',
		isPreRelease: false
	},
	projectType: ProjectType.DockerApplication,
	projectInfo: null
};

const loggableBuildContext: LoggableBuildContext = {
	commandInfo: {
		type: CommandType.FULL_BUILD
	},
	buildToolInfo: {
		group: '',
		name: '',
		version: '',
		isPreRelease: false
	},
	projectType: ProjectType.DockerApplication,
	projectInfo: {
		group: '',
		name: '',
		version: '',
		isPreRelease: false
	}
}

const buildContext: BuildContext = {
	commandInfo: {
		type: CommandType.FULL_BUILD
	},
	buildToolInfo: {
		group: '',
		name: '',
		version: '',
		isPreRelease: false
	},
	projectType: ProjectType.DockerApplication,
	projectInfo: {
		group: '',
		name: '',
		version: '',
		isPreRelease: false
	}
};

describe('contextLogging', () => {
	it('toLoggableContext with IncompleteBuildContext', () => {
		throw new Error();
	});

	it('toLoggableContext with BuildContext', () => {
		throw new Error();
	});
});
