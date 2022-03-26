import {
  Events,
  iPubSub,
  PubSubChannel,
} from "../../../infrastructure/interfaces";
import {
  iProcess,
  iProcessHandler,
} from "../../../infrastructure/interfaces/processHandler.interface";

export const whatsAppGetStatusUserCase = async (
  processHandler: iProcessHandler,
  pubSub: iPubSub,
  commercePhoneNumber: string
): Promise<iProcess[]> => {
  pubSub.publish(
    PubSubChannel.onWhatsAppEvent,
    {
      to: commercePhoneNumber,
      event: Events.STATUS,
      data: {
        commercePhoneNumber,
      },
    },
    "ExternalPubSubBroker"
  );
  return await processHandler.getProcess(commercePhoneNumber);
};

export const whatsAppGetAllStatusUserCase = async (
  processHandler: iProcessHandler,
  pubSub: iPubSub
): Promise<iProcess[]> => {
  pubSub.publish(
    PubSubChannel.onWhatsAppEvent,
    {
      to: "all",
      event: Events.STATUS,
      data: undefined,
    },
    "ExternalPubSubBroker"
  );
  return await processHandler.list();
};
