import { Environment } from "./app.interface";

export type ErrorType = "INFO" | "WARNING" | "ERROR" | "DEBUG";

export type iLoggerArgs = { type?: ErrorType; tag?: string; msg: string };

export interface iLogger {
  readonly env: Environment;
  log(args: iLoggerArgs): void;
}
