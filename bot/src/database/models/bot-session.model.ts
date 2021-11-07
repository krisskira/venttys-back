import { Schema, model } from "mongoose";
import { BotSession } from "../../bot/domain/bot.session.entity";

const BotSessionSchema = new Schema<BotSession>({
    phone: { type: String, unique: true, index: true },
    currentIntent: { type: Schema.Types.ObjectId, ref: "BotIntent" }
}, {
    timestamps: true
});

export default model("BotSession", BotSessionSchema, "sessions");
