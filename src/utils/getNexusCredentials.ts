import * as Either from 'fp-ts/Either';
import * as Option from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import shellEnv from 'shell-env';
import { EnvironmentVariables } from '../env/EnvironmentVariables';
import * as O from 'fp-ts/Option';

export interface NexusCredentials {
	readonly userName: string;
	readonly password: string;
}

export const getNexusCredentials = (): Either.Either<Error, NexusCredentials> =>
	pipe(
		Option.of(shellEnv.sync<EnvironmentVariables>()),
		Option.bindTo('env'),
		Option.bind('userName', ({ env }) => O.fromNullable(env.NEXUS_USER)),
		Option.bind('password', ({ env }) =>
			O.fromNullable(env.NEXUS_PASSWORD)
		),
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		Option.map(({ env, ...creds }): NexusCredentials => creds),
		Either.fromOption(
			() => new Error('Missing Nexus credential environment variables')
		)
	);
