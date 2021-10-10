import { spawn } from "child_process";

import { ErrorCodes } from "../../domain";
import {
  iLogger,
  iProcess,
  iProcessArgs,
  iProcessHandler,
  iProcessMessageArgs,
} from "../interfaces";

type emptyFunction = (
  args: string | number | null | undefined
) => void | undefined;
interface ShellProcessHandlerRunCommandArgs {
  command: {
    name: string;
    arguments?: string[];
  };
  onData?: emptyFunction;
  onClose?: emptyFunction;
  onError?: emptyFunction;
}

export class ShellProcessHandler implements iProcessHandler {
  private readonly _TAG = "***-> Process Handler: ";
  private _logger?: iLogger;

  constructor(logger?: iLogger) {
    this._logger = logger;
  }

  init = async (): Promise<void> => {
    this.runCommand({
      command: {
        name: "docker",
        arguments: ["--version"],
      },
    });
  };

  run = async (process: iProcessArgs): Promise<void> => {
    throw ErrorCodes.noImplementYet;
  };

  stop = async (process: string): Promise<void> => {
    throw ErrorCodes.noImplementYet;
  };

  restart = async (process: string): Promise<void> => {
    throw ErrorCodes.noImplementYet;
  };

  list = async (): Promise<iProcess[]> => {
    return new Promise<iProcess[]>((resolve, reject) => {
      throw ErrorCodes.noImplementYet;
    });
  };

  getProcess = async (processName: string | number): Promise<iProcess[]> => {
    return new Promise<iProcess[]>((resolve, reject) => {
      throw ErrorCodes.noImplementYet;
    });
  };

  sendMessage = async (args: iProcessMessageArgs): Promise<void> => {
    throw ErrorCodes.noImplementYet;
  };

  onDestroyClass = async (): Promise<void> => {
    this._logger?.log({
      type: "WARNING",
      tag: this._TAG,
      msg: "Stopped Process Handler",
    });
  };

  private runCommand(args: ShellProcessHandlerRunCommandArgs): void {
    const ls = spawn(args.command.name, args.command.arguments);
    ls.stdout.on("data", args.onData || this.onData);
    ls.stderr.on("data", args.onError || this.onError);
    ls.on("close", this.onClose);
    ls.on("error", ({ message: m = "", stack: s = "" }) => {
      args.onError ? args.onError(`${m}\n${s}`) : this.onError(`${m}\n${s}`);
    });
  }

  private onData(data: string) {
    this._logger?.log({
      type: "INFO",
      tag: this._TAG,
      msg: data,
    });
  }

  private onClose(code: number | null) {
    this._logger?.log({
      type: "INFO",
      tag: this._TAG,
      msg: `Child process exited with code ${code || 0}`,
    });
  }

  private onError(error: string) {
    this._logger?.log({
      type: "ERROR",
      tag: this._TAG,
      msg: error,
    });
  }
}
