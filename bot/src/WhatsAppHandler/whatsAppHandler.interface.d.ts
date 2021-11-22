import { iPubSub } from "../interfaces/pubSub.interface";
import { Bot } from "../interfaces/bot.interface";
import { iLogger } from "../interfaces/logger.interface";

export interface WhatsAppHandlerContructorArgs {
    commercePhoneNumber: string,
    logger: iLogger,
    pubSub: iPubSub,
    bot: Bot
}