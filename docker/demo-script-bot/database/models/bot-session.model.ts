import { Schema, model } from "mongoose";
import { BotIntent } from "./intent.model";

export interface BotSession {
    phone: string,
    currentIntent: string | Schema.Types.ObjectId | BotIntent,
    vars: Record<string, unknown>[],
    createAt?: Date,
    updateAt?: Date,
}

const BotSessionSchema = new Schema<BotSession>({
    phone: { type: String, unique: true, index: true },
    currentIntent: { type: Schema.Types.ObjectId, ref: "BotIntent" }
}, {
    timestamps: true
});

export default model("BotSession", BotSessionSchema);
