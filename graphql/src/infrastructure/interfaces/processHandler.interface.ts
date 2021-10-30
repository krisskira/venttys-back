import { WhatsAppMessageType } from "../whatsapp-handler/interface";

export type ProcessStatus =
  | "online"
  | "stopping"
  | "stopped"
  | "launching"
  | "errored"
  | "one-launch-status";

export interface iProcessArgs {
  processName: string;
  scriptPath: string;
  envVars: { [key: string]: string };
}

export interface iProcessMessageArgs {
  code: WhatsAppMessageType;
  processName: string;
}

export interface iProcess {
  code?: string;
  processId?: string | number;
  processStatus?: {
    memory?: number;
    cpu?: number;
    status?: ProcessStatus;
    uptime?: number;
    restartTime?: number;
  };
  raw?: unknown;
}

export interface iProcessHandler {
  init: () => Promise<string[] | void>;
  run: (process: iProcessArgs) => Promise<string[] | void>;
  stop: (process: string) => Promise<string[] | void>;
  restart: (process: string) => Promise<string[] | void>;
  list: () => Promise<iProcess[]>;
  getProcess: (processName: string | number) => Promise<iProcess[]>;
  sendMessage: (args: iProcessMessageArgs) => Promise<void>;
  onDestroyClass: () => Promise<void>;
}
