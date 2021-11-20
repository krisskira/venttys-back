import { Schema } from "mongoose";
import { BotIntent } from "./bot-intent.entity";

export interface BotSessionVar {
    key: string,
    content: string,
    type?: "array" | "single"
}
export interface BotSession {
    phone: string,
    currentIntent: Schema.Types.ObjectId | BotIntent,
    vars: BotSessionVar[],
    createdAt?: Date,
    updatedAt?: Date,
    is_active: boolean,
}
