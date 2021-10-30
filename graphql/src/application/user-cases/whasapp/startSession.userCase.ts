import { CommerceBasicInfo } from "../../../domain/commerce.interface";
import {
  iProcessArgs,
  iProcessHandler,
} from "../../../infrastructure/interfaces/processHandler.interface";

export const whatsAppStartSessionUseCase = async (
  processHandler: iProcessHandler,
  whatsappPathScriptHandler: string,
  commerceInfo: CommerceBasicInfo
): Promise<string[]> => {
  const { phoneNumber: processName, name: commerceName } = { ...commerceInfo };
  const args: iProcessArgs = {
    processName,
    scriptPath: whatsappPathScriptHandler,
    envVars: {
      commerceName: commerceName,
      commerceNumber: processName,
    },
  };
  const result = await processHandler.run(args);
  return result || [];
};
