import { iLogger } from "./logger.interface";
import { iProcessHandler } from "./processHandler.interface";
import { iPubSub } from "./pubSub.interface";
import { iServerSettings } from "./server.interface";

export type Environment = "development" | "test" | "production";

export interface iApplication {
  start(args: iServerSettings): void;
}

export interface iApplicationParams {
  environment?: Environment;
  logger: iLogger;
  processHandler: iProcessHandler;
  pubSub: iPubSub;
}

export interface iApplicationContext {
  token?: string | unknown;
  environment?: Environment;
  logger: iLogger;
  processHandler: iProcessHandler;
  pubSub: iPubSub;
  headers: Record<string, unknown>;
}
