import { join } from "path";
import { Environment } from "../interfaces/app.interface";
import { createLogger, format, Logger, transports } from "winston";
import { iLogger, iLoggerArgs } from "../interfaces/logger.interface";

export class WistonLogger implements iLogger {
    env: Environment;
    private _logger: Logger;

    constructor(env: Environment) {
        this.env = env;
        const transporOptionBuilder = (level: string) => {
            return {
                dirname: join(__dirname, "../../logs"),
                filename: level + ".log",
                level: level,
                maxsize: 5 * 1024 * 1024,
                maxFiles: 5,
                format: format.combine(
                    format.timestamp(),
                    format.printf(
                        ({ level, message, timestamp }) =>
                            `[${timestamp}] [${level}]:\n${message}\n`
                    ),
                ),
            };
        };
        this._logger = createLogger({
            level: "debug",
            format: format.combine(format.simple()),
            transports: [
                new transports.File(transporOptionBuilder("error")),
                new transports.File(transporOptionBuilder("warn")),
                new transports.File(transporOptionBuilder("info")),
            ],
        });

        if (env !== "production") {
            this._logger.add(
                new transports.Console({
                    level: "debug",
                    format: format.combine(format.colorize(), format.simple()),
                })
            );
        }
    }

    log(args: iLoggerArgs): void {
        switch (args.type) {
        case "DEBUG":
            this._logger.log({
                level: "debug",
                message: args.tag + ": " + args.msg,
            });
            break;
        case "INFO":
            this._logger.log({
                level: "info",
                message: args.tag + ": " + args.msg,
            });
            break;
        case "WARNING":
            this._logger.log({
                level: "warn",
                message: args.tag + ": " + args.msg,
            });
            break;
        case "ERROR":
            this._logger.log({
                level: "error",
                message: args.tag + ": " + args.msg,
            });
            break;
        }
    }
}
