import { Controller } from "../../domain";
import { CommerceBasicInfo } from "../../domain/commerce.interface";
import {
  whatsAppCloseSessionUserCase,
  whatsAppGetStatusUserCase,
  whatsAppReconnectUserCase,
  whatsAppStartSessionUseCase,
} from "../user-cases/whasapp";
import { WhatsAppScriptPathHandler } from "./../../infrastructure/whatsapp-handler/interface";

export const whatsAppHandlerStartSessionController: Controller<
  CommerceBasicInfo,
  Promise<void>
> = async (commerceBasicInfo, appContext): Promise<void> => {
  return await whatsAppStartSessionUseCase(
    appContext!.processHandler,
    WhatsAppScriptPathHandler,
    commerceBasicInfo!
  );
};

export const whatsAppHandlerStatusController: Controller<
  string,
  Promise<void>
> = async (commercePhoneNumber, appContext): Promise<void> => {
  return await whatsAppGetStatusUserCase(
    appContext!.processHandler,
    commercePhoneNumber!
  );
};

export const whatsAppHandlerReconectController: Controller<
  CommerceBasicInfo,
  Promise<void>
> = async (commerceBasicInfo, appContext): Promise<void> => {
  return await whatsAppReconnectUserCase(
    appContext!.processHandler,
    commerceBasicInfo!
  );
};

export const whatsAppHandlerCloseController: Controller<
  string,
  Promise<void>
> = async (commercePhoneNumber, appContext): Promise<void> => {
  return await whatsAppCloseSessionUserCase(
    appContext!.processHandler,
    commercePhoneNumber!
  );
};
