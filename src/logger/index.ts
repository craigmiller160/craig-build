// import pino from 'pino';
//
// export const logger = pino({
// 	level: 'debug',
// 	transport: {
// 		target: 'pino-pretty',
// 		options: {
// 			translateTime: 'yyyy-mm-dd HH:MM:ss.l',
// 			colorize: true
// 		}
// 	}
// });

import { createLogger, transports, format } from 'winston';

const myFormat = format.printf(
	({ level, message, timestamp }) => `${timestamp} [${level}] - ${message}`
);

export const logger = createLogger({
	level: 'debug',
	format: format.combine(
		format.timestamp(),
		format.colorize(),
		format.prettyPrint(),
		format.simple(),
		myFormat
	),
	transports: [new transports.Console()]
});
