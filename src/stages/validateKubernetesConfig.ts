import { Stage, StageFunction } from './Stage';
import { BuildContext } from '../context/BuildContext';
import { match } from 'ts-pattern';

const validateConfigByProject = (context: BuildContext) =>
	match(context)
		.with({  })

const execute: StageFunction = (context) => {
	throw new Error();
};

export const validateKubernetesConfig: Stage = {
	name: 'Validate Kubernetes Config',
	execute
};
