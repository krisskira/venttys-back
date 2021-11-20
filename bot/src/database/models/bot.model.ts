import { Schema, model } from "mongoose";
import { BotIntent } from "../../bot/domain/bot-intent.entity";

export interface Bot {
    code: string,
    intents: Schema.Types.ObjectId[] | BotIntent[],
    default: Schema.Types.ObjectId | BotIntent
}

const BotSchema = new Schema<Bot>({
    code: { type: String, unique: true, index: true, default: "default"},
    intents: [{ type: Schema.Types.ObjectId, ref: "BotIntent"}],
    default: { type: Schema.Types.ObjectId, ref: "BotIntent", required: true}
});

export default model("Bot", BotSchema, "bots");
