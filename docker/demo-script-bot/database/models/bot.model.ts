import { Schema, model } from "mongoose";
import { BotIntent } from "./intent.model";

export interface Bot {
    code: string,
    intents: string[] | Schema.Types.ObjectId[] | BotIntent[],
    default: string | Schema.Types.ObjectId | BotIntent
}

const BotSchema = new Schema<Bot>({
    code: { type: String, unique: true, index: true, default: "default"},
    intents: { type: [Schema.Types.ObjectId], ref: "BotIntent", default: []},
    default: { type: Schema.Types.ObjectId, ref: "BotIntent", required: true}
});

export default model("Bot", BotSchema);
