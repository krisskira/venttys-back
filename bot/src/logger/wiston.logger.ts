import { join } from "path";
import { Environment } from "../interfaces/app.interface";
import { createLogger, format, Logger, transports } from "winston";
import { ErrorType, iLogger, iLoggerArgs } from "../interfaces/logger.interface";

export class WistonLogger implements iLogger {
    env: Environment;
    private loggers: Record<ErrorType, Logger>;

    constructor(env: Environment) {
        this.env = env;
        const levels: ErrorType[] = [
            "INFO", "WARNING", "ERROR"
        ];

        this.loggers = levels.reduce((obj, level) => ({
            ...obj,
            [level]: createLogger({
                transports: [
                    new transports.File(this.transporOptionBuilder(level)),
                ],
            })
        }), {} as Record<ErrorType, Logger>);

        if (env !== "production") {
            this.loggers["DEBUG"] = createLogger({
                level: "debug",
                transports: [
                    new transports.File(this.transporOptionBuilder("DEBUG")),
                    new transports.Console({
                        format: format.combine(
                            format.timestamp(),
                            format.colorize(),
                            format.printf(
                                ({ level, message, timestamp, tag = "" }) =>
                                    // https://en.wikipedia.org/wiki/ANSI_escape_code#Colors
                                    `[${timestamp}] [${level}]: \x1b[1m${tag}\x1b[0m\n` +
                                    `\x1b[2m${message}\x1b[0m\n`
                            ),
                        ),
                    }),
                ],
            });
        }
    }

    log(args: iLoggerArgs): void {
        const level = args.type || "DEBUG";
        this.loggers[level].log({
            level: level.toLowerCase(),
            message: args.msg,
            tag: args.tag,
        });
    }

    private transporOptionBuilder(level: ErrorType): transports.FileTransportOptions {
        return {
            level: level.toLowerCase(),
            filename: level.toLowerCase() + ".log",
            dirname: join(__dirname, "../../logs"),
            maxsize: 5 * 1024 * 1024,
            maxFiles: 5,
            tailable: true,
            format: format.combine(
                format.timestamp(),
                format.printf(
                    ({ level, message, timestamp, tag = "" }) =>
                        `[${timestamp}] [${level}]: ${tag}` +
                        `\n${message}\n`
                ),
            ),
        };
    }
}
