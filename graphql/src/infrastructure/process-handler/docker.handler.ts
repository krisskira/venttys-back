import { spawnSync } from "child_process";

import {
  Environment,
  iLogger,
  iProcess,
  iProcessArgs,
  iProcessHandler,
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

export class DockerProcessHandler implements iProcessHandler {
  private readonly TAG = "DockerProcessHandler";
  private _logger?: iLogger;
  private _env: Environment;
  private _pubSubServer: string;
  private readonly _databaseUri?: string;

  constructor(
    logger?: iLogger,
    environment: Environment = "production",
    pubSubServer = "venttys-kafka:9092",
    databaseUri?: string
  ) {
    this._logger = logger;
    this._env = environment;
    this._pubSubServer = pubSubServer;
    this._databaseUri = databaseUri;
  }

  init = async (): Promise<string[]> => {
    return this.runCommand({
      command: {
        name: "docker",
        arguments: ["--version"],
      },
    }).split("\n");
  };

  run = async (process: iProcessArgs): Promise<string[]> => {
    const imageName = "nginx"; // "whatsapp-handler";
    const { commerceName = "", commerceNumber = "" } = process.envVars;
    const db = this._databaseUri
      ? ["-e", `MONGODB_URL="${this._databaseUri}"`]
      : [];
    const commandArguments = [
      "run",
      "--rm",
      "-d",
      "--network=venttys-net",
      "-v",
      "venttys-wh-tokens:/home/app/tokens",
      "-v",
      "venttys-wh-public:/home/app/public",
      "--name",
      "phone" + commerceNumber.replace(/\+/g, "_"),
      "-e",
      `COMMERCE="${commerceName}"`,
      "-e",
      `NODE_ENV="${this._env}"`,
      "-e",
      `PHONE="${commerceNumber}"`,
      ...db,
      "-e",
      `EXTERNAL_PUBSUB_SERVER="${this._pubSubServer}"`,
      imageName,
    ];

    return this.runCommand({
      command: {
        name: "docker",
        arguments: commandArguments,
      },
    }).split("\n");
  };

  stop = async (process: string): Promise<string[]> => {
    const commandArguments = ["stop", "phone" + process.replace(/\+/g, "_")];
    return this.runCommand({
      command: {
        name: "docker",
        arguments: commandArguments,
      },
    }).split("\n");
  };

  restart = async (process: string): Promise<string[]> => {
    const commandArguments = ["restart", "phone" + process.replace(/\+/g, "_")];
    return this.runCommand({
      command: {
        name: "docker",
        arguments: commandArguments,
      },
    }).split("\n");
  };

  list = async (): Promise<iProcess[]> => {
    const format =
      "{" +
      '"id":"{{.ID}}",' +
      '"status":"{{.Status}}",' +
      '"ports":"{{.Ports}}",' +
      '"name":"{{.Names}}"' +
      "}";

    const commandArguments = ["ps", "--format", format];
    const result = this.runCommand({
      command: {
        name: "docker",
        arguments: commandArguments,
      },
    });
    try {
      const data = result
        .replace("}{", "}\n{")
        .split("\n")
        .filter((s) => s)
        .map((s) => JSON.parse(s));
      return [{ raw: data }];
    } catch (error) {
      return [{ raw: result.split("\n") }];
    }
  };

  getProcess = async (processName: string | number): Promise<iProcess[]> => {
    const format = '--format="[{{json .Config}},{{json .State}}]"';
    const commandArguments = [
      "inspect",
      `phone${processName}`.replace(/\+/g, "_"),
      format,
    ];
    const result = this.runCommand({
      command: {
        name: "docker",
        arguments: commandArguments,
      },
    });

    try {
      const [raw, status] = JSON.parse(result);
      return [
        {
          code: raw.Hostname,
          processId: status.Pid,
          processStatus: {
            status: status.Status,
            uptime: status.StartedAt,
            restartTime: status.FinishedAt,
          },
          raw: { config: raw, status },
        },
      ];
    } catch {
      return [
        {
          raw: result,
        },
      ];
    }
  };

  sendMessage = async (): Promise<void> => {
    // throw ErrorCodes.noImplementYet;
  };

  onDestroyClass = async (): Promise<void> => {
    this._logger?.log({
      type: "WARNING",
      tag: this.TAG,
      msg: "Stopped Process Handler",
    });
  };

  private runCommand(args: ShellProcessHandlerRunCommandArgs): string {
    const ls = spawnSync(args.command.name, args.command.arguments);
    const error = ls.stderr?.toString();
    if (error) {
      this.onError(error);
      throw error;
    }
    const data = ls.output
      ?.map((s) =>
        s
          ?.toString()
          .replace("\n", "")
          .replace('"{', "{")
          .replace('}"', "}")
          .replace(/\\\\"/g, '\\"')
          .replace(/"\[/, "[")
          .replace(/\]"/, "]")
      )
      .filter((r) => r);
    return data.join("\n");
  }

  private onError(error: string) {
    this._logger?.log({
      type: "ERROR",
      tag: this.TAG,
      msg: `${error}`,
    });
  }
}
