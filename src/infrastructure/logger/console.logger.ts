import { Environment } from "../interfaces/application.interface";
import { iLogger, iLoggerArgs } from "../interfaces/logger.interface";

export class ConsoleLogger implements iLogger {
  readonly env: Environment;

  constructor(env: Environment) {
    this.env = env;
  }

  log(arg: iLoggerArgs): void {
    switch (arg.type) {
      case "INFO":
        console.info(`${arg.type}: `, arg.tag, arg.msg);
        break;
      case "WARNING":
        console.warn(`${arg.type}: `, arg.tag, arg.msg);
        break;
      case "ERROR":
        console.error(`${arg.type}: `, arg.tag, arg.msg);
        break;
      default:
        this.env !== "production" && console.log(arg.tag, arg.msg);
    }
  }
}
