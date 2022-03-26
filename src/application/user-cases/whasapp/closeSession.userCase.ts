import { iProcessHandler } from "../../../infrastructure/interfaces/processHandler.interface";

export const whatsAppCloseSessionUserCase = async (
  processHandler: iProcessHandler,
  commercePhoneNumber: string
): Promise<string[]> => {
  const result = await processHandler.stop(commercePhoneNumber);
  return result || [];
};
