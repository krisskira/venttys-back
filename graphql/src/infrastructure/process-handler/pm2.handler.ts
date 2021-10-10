import {
  connect,
  describe,
  disconnect,
  list,
  Proc,
  restart,
  sendSignalToProcessName,
  start,
  stop,
} from "pm2";

import { iLogger } from "../interfaces/logger.interface";
import {
  iProcess,
  iProcessArgs,
  iProcessHandler,
  iProcessMessageArgs,
} from "../interfaces/processHandler.interface";

export class PM2ProcessHandler implements iProcessHandler {
  private _logger?: iLogger;
  private readonly _TAG = "***-> Process Handler: ";

  constructor(logger?: iLogger) {
    this._logger = logger;
    process.on("SIGTERM", () => {
      this.destructor();
    });
  }

  async onDestroyClass(): Promise<void> {
    this._logger?.log({
      type: "WARNING",
      tag: this._TAG,
      msg: "Stopped Process Handler",
    });
    process.exit(0);
  }

  async init(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      connect((error) => {
        this._logger?.log({
          type: !!error ? "ERROR" : "INFO",
          tag: this._TAG,
          msg: !!error ? JSON.stringify({ ...error }) : "Running",
        });
        !!error ? reject(error) : resolve();
      });
    });
  }

  async run(proccesInfo: iProcessArgs): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      start(
        {
          script: proccesInfo.scriptPath,
          name: proccesInfo.processName,
          env: proccesInfo.envVars,
        },
        (err, proc) => this.errProcCallback(err, proc, resolve, reject)
      );
    });
  }

  async stop(procName: string | number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      stop(procName, (err, proc) =>
        this.errProcCallback(err, proc, resolve, reject)
      );
    });
  }

  async restart(proc: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      restart(proc, (err, proc) =>
        this.errProcCallback(err, proc, resolve, reject)
      );
    });
  }

  async getProcess(processName: string | number): Promise<iProcess[]> {
    return new Promise<iProcess[]>((resolve, reject) => {
      describe(processName, (error, processDescList) => {
        !!error &&
          this._logger?.log({
            type: "ERROR",
            tag: this._TAG,
            msg: JSON.stringify(error),
          });

        !!error
          ? reject(error)
          : resolve(
              processDescList.map<iProcess>((proc) => {
                return {
                  code: proc.name,
                  processId: proc.pm_id,
                  processStatus: {
                    status: proc.pm2_env?.status,
                    cpu: proc.monit?.cpu,
                    memory: proc.monit?.memory,
                    uptime: proc.pm2_env?.pm_uptime,
                    restartTime: proc.pm2_env?.restart_time,
                  },
                };
              })
            );
      });
    });
  }

  async list(): Promise<iProcess[]> {
    return new Promise<iProcess[]>((resolve, reject) => {
      list((error, processDescList) => {
        !!error &&
          this._logger?.log({
            type: "ERROR",
            tag: this._TAG,
            msg: JSON.stringify({ ...error }),
          });

        !!error
          ? reject(error)
          : resolve(
              processDescList.map<iProcess>((proc) => {
                return {
                  code: proc.name,
                  processId: proc.pm_id,
                  processStatus: {
                    status: proc.pm2_env?.status,
                    cpu: proc.monit?.cpu,
                    memory: proc.monit?.memory,
                    uptime: proc.pm2_env?.pm_uptime,
                    restartTime: proc.pm2_env?.restart_time,
                  },
                };
              })
            );
      });
    });
  }

  async sendMessage(args: iProcessMessageArgs): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      sendSignalToProcessName(args.code, args.processName, (err, proc) =>
        this.errProcCallback(err, proc, resolve, reject)
      );
    });
  }

  private errProcCallback(
    error: Error,
    proc: Proc,
    resolve: () => void,
    reject: (reason?: unknown) => void
  ): void {
    this._logger?.log({
      type: !!error ? "ERROR" : "INFO",
      tag: this._TAG,
      msg: !!error
        ? error.toString()
        : JSON.stringify({
            process: proc?.name,
            processId: proc?.pm_id,
            processStatus: proc?.status,
          }),
    });
    !!error ? reject(error) : resolve();
  }

  private destructor(): void {
    disconnect();
    this.onDestroyClass();
  }
}
