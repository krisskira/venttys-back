import { iProcessHandler } from "../../../infrastructure/interfaces/processHandler.interface";

export const whatsAppCloseSessionUserCase = async (
  processHandler: iProcessHandler,
  commercePhoneNumber: string
): Promise<void> => {
  await processHandler.stop(commercePhoneNumber);
};
