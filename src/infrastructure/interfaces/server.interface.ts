import { Request, Response } from "express";

import { Environment } from "./application.interface";

export interface iServerSettings {
  port: number;
  env: Environment;
}

export interface iServerContext {
  req: Request; // TODO: Define appropriate type
  res: Response; // TODO: Define appropriate type
}
