import { WhatsAppMessageType } from "../whatsapp-handler/interface";

export type ProcessStatus =
  | "online"
  | "stopping"
  | "stopped"
  | "launching"
  | "errored"
  | "one-launch-status";
interface iProcessArgs {
  processName: string;
  scriptPath: string;
  envVars: { [key: string]: string };
}

interface iProcessMessageArgs {
  code: WhatsAppMessageType;
  processName: string;
}

interface iProcess {
  code?: string;
  processId?: string | number;
  processStatus?: {
    memory?: number;
    cpu?: number;
    status?: ProcessStatus;
    uptime?: number;
    restartTime?: number;
  };
}

export interface iProcessHandler {
  init: () => Promise<void>;
  run: (process: iProcessArgs) => Promise<void>;
  stop: (process: string) => Promise<void>;
  restart: (process: string) => Promise<void>;
  list: () => Promise<iProcess[]>;
  getProcess: (processName: string | number) => Promise<iProcess[]>;
  sendMessage: (args: iProcessMessageArgs) => Promise<void>;
  onDestroyClass: () => Promise<void>;
}
