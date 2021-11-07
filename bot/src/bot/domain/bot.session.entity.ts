import { Schema } from "mongoose";
import { BotIntent } from "./bot-intent.entity";

export interface BotSession {
    phone: string,
    currentIntent: string | Schema.Types.ObjectId | BotIntent,
    vars: Record<string, unknown>[],
    createAt?: Date,
    updateAt?: Date,
}