import { FilterFn, ResolverFn, withFilter } from "graphql-subscriptions";

import {
  whatsAppHandlerCloseController,
  whatsAppHandlerReconectController,
  whatsAppHandlerStartSessionController,
  whatsAppHandlerStatusController,
} from "../../../../application/controllers";
import { CommerceBasicInfo } from "../../../../domain/commerce.interface";
import { iResolver } from "../../../../infrastructure/graphql-server/interfaces";
import { Notification } from "../../../../infrastructure/interfaces";

const initWhatsAppListener: iResolver<{ commerceInfo: CommerceBasicInfo }> =
  async (...[, { commerceInfo }, context]) => {
    return await whatsAppHandlerStartSessionController(commerceInfo, context);
  };

const getWhatsAppStatus: iResolver<{ phoneNumber: string }> = async (
  ...[, { phoneNumber: commercePhoneNumber }, context]
) => {
  return await whatsAppHandlerStatusController(commercePhoneNumber, context);
};

const whatsAppReconnect: iResolver<{ commerceInfo: CommerceBasicInfo }> =
  async (...[, { commerceInfo }, context]) => {
    return await whatsAppHandlerReconectController(commerceInfo, context);
  };

const stopWhatsAppListener: iResolver<{ phoneNumber: string }> = async (
  ...[, { phoneNumber: commercePhoneNumber }, context]
) => {
  return await whatsAppHandlerCloseController(commercePhoneNumber, context);
};

const subscWhatsappEvents: iResolver<Notification<unknown>> = (
  ...[, , context]
) => {
  return context!.pubSub.asyncIterator(["onWhatsAppEvent"]);
};

const subscFilterFunc: iResolver<{ token: string }> = (
  ...[, { token = "empty" }, context]
) => {
  context?.logger?.log({
    type: "DEBUG",
    tag: "***-> Token: ",
    msg: token,
  });
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
