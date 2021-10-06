import { iPubSub } from "../interfaces/pubSub.interface";
import { iBot } from "../interfaces/bot.interface";
import { iLogger } from "../interfaces/logger.interface";

export interface WhatsAppHandlerContructorArgs {
    phoneNumber: string,
    logger: iLogger,
    pubSub: iPubSub,
    bot: iBot
}