import { predicate } from 'fp-ts';
import { CommandType } from './CommandType';

export const isFullBuild: predicate.Predicate<CommandType> = (commandType) =>
	CommandType.FullBuild === commandType;

export const isDockerOnly: predicate.Predicate<CommandType> = (commandType) =>
	CommandType.DockerOnly === commandType;

export const isKubernetesOnly: predicate.Predicate<CommandType> = (
	commandType
) => CommandType.KubernetesOnly === commandType;

export const isTerraformOnly: predicate.Predicate<CommandType> = (
	commandType
) => CommandType.TerraformOnly === commandType;
