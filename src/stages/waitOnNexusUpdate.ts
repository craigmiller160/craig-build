import { Stage, StageFunction } from './Stage';

const execute: StageFunction = (context) => {
	throw new Error();
};

export const waitOnNexusUpdate: Stage = {
	name: 'Wait On Nexus Update',
	execute
};
