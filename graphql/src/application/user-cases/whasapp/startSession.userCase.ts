import { CommerceBasicInfo } from "../../../domain/commerce.interface";
import {
  iProcessArgs,
  iProcessHandler,
} from "../../../infrastructure/interfaces/processHandler.interface";

export const whatsAppStartSessionUseCase = async (
  processHandler: iProcessHandler,
  whatsappPathScriptHandler: string,
  commerceInfo: CommerceBasicInfo
): Promise<void> => {
  const { phoneNumber: processName, name: commerceName } = { ...commerceInfo };
  const args: iProcessArgs = {
    processName,
    scriptPath: whatsappPathScriptHandler,
    envVars: {
      commerceName: commerceName,
      commerceNumber: processName,
    },
  };
  await processHandler.run(args);
};
