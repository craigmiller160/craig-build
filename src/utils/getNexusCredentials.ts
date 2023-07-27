import { either } from 'fp-ts';
import { option } from 'fp-ts';
import { function as func } from 'fp-ts';
import shellEnv from 'shell-env';
import { EnvironmentVariables } from '../env/EnvironmentVariables';

export interface NexusCredentials {
	readonly userName: string;
	readonly password: string;
}

export const getNexusCredentials = (): either.Either<Error, NexusCredentials> =>
	func.pipe(
		option.of(shellEnv.sync<EnvironmentVariables>()),
		option.bindTo('env'),
		option.bind('userName', ({ env }) =>
			option.fromNullable(env.NEXUS_USER)
		),
		option.bind('password', ({ env }) =>
			option.fromNullable(env.NEXUS_PASSWORD)
		),
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		option.map(({ env, ...creds }): NexusCredentials => creds),
		either.fromOption(
			() => new Error('Missing Nexus credential environment variables')
		)
	);
