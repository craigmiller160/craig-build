import * as P from 'fp-ts/Predicate';
import { CommandType } from './CommandType';

export const isFullBuild: P.Predicate<CommandType> = (commandType) =>
	CommandType.FullBuild === commandType;

export const isDockerOnly: P.Predicate<CommandType> = (commandType) =>
	CommandType.DockerOnly === commandType;

export const isKubernetesOnly: P.Predicate<CommandType> = (commandType) =>
	CommandType.KubernetesOnly === commandType;

export const isTerraformOnly: P.Predicate<CommandType> = (commandType) =>
	CommandType.TerraformOnly === commandType;
