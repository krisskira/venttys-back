import { CommerceBasicInfo } from "../../../domain/commerce.interface";
import {
  Events,
  iPubSub,
  PubSubChannel,
} from "../../../infrastructure/interfaces";

export const whatsAppReconnectUserCase = async (
  pubSub: iPubSub,
  commerceInfo: CommerceBasicInfo
): Promise<void> => {
  pubSub.publish(
    PubSubChannel.onWhatsAppEvent,
    {
      to: commerceInfo.phoneNumber,
      event: Events.RECONNECT,
      data: {
        ...commerceInfo,
      },
    },
    "ExternalPubSubBroker"
  );
};
