import {
  iProcess,
  iProcessHandler,
} from "../../../infrastructure/interfaces/processHandler.interface";

export const getProcessUserCase = async (
  processHandler: iProcessHandler,
  commercePhoneNumber: string
): Promise<iProcess[]> => {
  return await processHandler.getProcess(commercePhoneNumber);
};
