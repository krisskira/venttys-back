import { FilterFn, ResolverFn, withFilter } from "graphql-subscriptions";

import {
  whatsAppHandlerAllStatusController,
  whatsAppHandlerCloseController,
  whatsAppHandlerReconectController,
  whatsAppHandlerStartSessionController,
  whatsAppHandlerStatusController,
} from "../../../../application/controllers";
import { CommerceBasicInfo } from "../../../../domain/commerce.interface";
import { iResolver } from "../../../../infrastructure/graphql-server/interfaces";
import {
  PubSubChannel,
  PubSubPayload,
} from "../../../../infrastructure/interfaces";

const initWhatsAppListener: iResolver<{
  commerceInfo: CommerceBasicInfo;
}> = async (...[, { commerceInfo }, context]) => {
  return await whatsAppHandlerStartSessionController(commerceInfo, context);
};

const stopWhatsAppListener: iResolver<{ phoneNumber: string }> = async (
  ...[, { phoneNumber: commercePhoneNumber }, context]
) => {
  return await whatsAppHandlerCloseController(commercePhoneNumber, context);
};

const getWhatsAppStatus: iResolver<{ phoneNumber: string }> = async (
  ...[, { phoneNumber: commercePhoneNumber }, context]
) => {
  return await whatsAppHandlerStatusController(commercePhoneNumber, context);
};

const getAllWhatsAppStatus: iResolver<void> = async (...[, , context]) =>
  await whatsAppHandlerAllStatusController(undefined, context);

const whatsAppReconnect: iResolver<{
  commerceInfo: CommerceBasicInfo;
}> = async (...[, { commerceInfo }, context]) => {
  return await whatsAppHandlerReconectController(commerceInfo, context);
};

const subscWhatsappEvents: iResolver<PubSubPayload<unknown>> = (
  ...[, , context]
) => {
  return context!.pubSub
    .getPubSub()
    .asyncIterator([PubSubChannel.onWhatsAppEvent]);
};

const subscFilterFunc: iResolver<{ token: string; phoneNumber: string }> = (
  ...[, { token = "empty", ...data }, context]
) => {
  console.log("***-> Data to filter: ", data, token, context);
  return true;
};

const onWhatsAppEvent = {
  subscribe: withFilter(
    subscWhatsappEvents as ResolverFn,
    subscFilterFunc as FilterFn
  ),
};

module.exports = {
  Query: {
    getWhatsAppStatus,
    getAllWhatsAppStatus,
  },
  Mutation: {
    initWhatsAppListener,
    whatsAppReconnect,
    stopWhatsAppListener,
  },
  Subscription: {
    onWhatsAppEvent,
  },
};
