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

const myFormat = format.printf(({ level, message, timestamp, stack }) => {
	return `[${timestamp}] [${level}] - ${stack ?? message}`;
});

export const logger = createLogger({
	level: 'debug',
	format: format.combine(
		format((info) => {
			info.level = info.level.toUpperCase();
			return info;
		})(),
		format.errors({
			stack: true
		}),
		format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss.SSS'
		}),
		format.colorize(),
		format.prettyPrint(),
		format.simple(),
		myFormat
	),
	transports: [new transports.Console()]
});
