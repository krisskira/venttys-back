import {
  iProcess,
  iProcessHandler,
} from "../../../infrastructure/interfaces/processHandler.interface";

export const getProcessListUserCase = async (
  processHandler: iProcessHandler
): Promise<iProcess[]> => await processHandler.list();
