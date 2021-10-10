import { iPubSub } from "@infrastructure/pub-sub/interface";

import { iLogger } from "./logger.interface";
import { iProcessHandler } from "./processHandler.interface";
import { iServerContext, iServerSettings } from "./server.interface";

export type Environment = "development" | "test" | "production";

export interface iApplication {
  start(args: iServerSettings): void;
  context(args: iServerContext): Promise<iApplicationContext>;
}

export interface iApplicationParams {
  environment?: Environment;
  logger?: iLogger;
  processHandler: iProcessHandler;
  pubSub: iPubSub;
}

export interface iApplicationContext {
  token?: string;
  environment?: Environment;
  logger?: iLogger;
  processHandler: iProcessHandler;
  pubSub: iPubSub;
}
