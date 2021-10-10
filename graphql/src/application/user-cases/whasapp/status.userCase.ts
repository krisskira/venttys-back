import { iProcessHandler } from "../../../infrastructure/interfaces/processHandler.interface";

export const whatsAppGetStatusUserCase = async (
  processHandler: iProcessHandler,
  commercePhoneNumber: string
): Promise<void> => {
  await processHandler.sendMessage({
    code: "GET_STATUS",
    processName: commercePhoneNumber,
  });
};
