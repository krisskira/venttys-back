import { Controller } from "../../domain";
import { CommerceBasicInfo } from "../../domain/commerce.interface";
import { iProcess } from "../../infrastructure/interfaces";
import {
  whatsAppCloseSessionUserCase,
  whatsAppGetAllStatusUserCase,
  whatsAppGetStatusUserCase,
  whatsAppReconnectUserCase,
  whatsAppStartSessionUseCase,
} from "../user-cases/whasapp";
import { WhatsAppScriptPathHandler } from "./../../infrastructure/whatsapp-handler/interface";

export const whatsAppHandlerStartSessionController: Controller<
  CommerceBasicInfo,
  Promise<string[]>
> = async (commerceBasicInfo, appContext): Promise<string[]> => {
  return await whatsAppStartSessionUseCase(
    appContext!.processHandler,
    WhatsAppScriptPathHandler,
    commerceBasicInfo!
  );
};

export const whatsAppHandlerCloseController: Controller<
  string,
  Promise<string[]>
> = async (commercePhoneNumber, appContext): Promise<string[]> => {
  return await whatsAppCloseSessionUserCase(
    appContext!.processHandler,
    commercePhoneNumber!
  );
};

export const whatsAppHandlerStatusController: Controller<
  string,
  Promise<iProcess[]>
> = async (commercePhoneNumber, appContext): Promise<iProcess[]> => {
  return await whatsAppGetStatusUserCase(
    appContext!.processHandler,
    appContext!.pubSub,
    commercePhoneNumber!
  );
};

export const whatsAppHandlerAllStatusController: Controller<
  void,
  Promise<iProcess[]>
> = async (_args, appContext): Promise<iProcess[]> => {
  return await whatsAppGetAllStatusUserCase(
    appContext!.processHandler,
    appContext!.pubSub
  );
};

// TODO: Complete send notification to reconnect
export const whatsAppHandlerReconectController: Controller<
  CommerceBasicInfo,
  Promise<void>
> = async (commerceBasicInfo, appContext): Promise<void> => {
  return await whatsAppReconnectUserCase(
    appContext!.pubSub,
    commerceBasicInfo!
  );
};
