import pino from 'pino';

export const logger = pino({
	level: 'debug',
	transport: {
		target: 'pino-pretty',
		options: {
			translateTime: 'yyyy-mm-dd HH:MM:ss.l'
		}
	}
});
