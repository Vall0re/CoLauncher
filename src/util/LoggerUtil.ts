import { createLogger, format, transports, Logger } from 'winston';
import { SPLAT } from 'triple-beam';
import { DateTime } from 'luxon';
import { inspect } from 'util';

interface LogInfo {
    message: string;
    level: string;
    label: string;
    stack?: string;
    [SPLAT]?: any[];
}

export class LoggerUtil {
    public static getLogger(label: string): Logger {
        return createLogger({
            format: format.combine(
                format.label(),
                format.colorize(),
                format.label({ label }),
                format.printf(info => {
                    const logInfo = info as unknown as LogInfo;

                    if (Array.isArray(logInfo[SPLAT]) && logInfo[SPLAT].length === 1 && logInfo[SPLAT][0] instanceof Error) {
                        const err: Error = logInfo[SPLAT][0];

                        if (typeof logInfo.message === "string" && logInfo.message.length > err.message.length &&
                            logInfo.message.endsWith(err.message)) {
                            logInfo.message = logInfo.message.substring(0, logInfo.message.length - err.message.length);
                        }
                    } else if (Array.isArray(logInfo[SPLAT]) && logInfo[SPLAT].length > 0) {
                        logInfo.message += " " + logInfo[SPLAT].map((it: any) => {
                            if (typeof it === 'object' && it !== null) {
                                return inspect(it, false, 4, true);
                            }
                            return it;
                        }).join(" ");
                    }

                    if (typeof logInfo.message === 'object') {
                        logInfo.message = inspect(logInfo.message, false, 4, true);
                    }

                    return `[${DateTime.local().toFormat('yyyy-MM-dd TT').trim()}] [${logInfo.level}] [${logInfo.label}]: ${logInfo.message}${logInfo.stack ? `\n${logInfo.stack}` : ''}`;
                })
            ),
            level: 'debug',
            transports: [
                new transports.Console()
            ]
        });
    }
}
