import { Schema, model } from "mongoose";
import { BotSession, BotSessionVar } from "../../bot/domain/bot.session.entity";

const SessionVarSchema = new Schema<BotSessionVar>({
    key: { type: String, required: true },
    content: { type: String, required: false }
}, { id: false });

const BotSessionSchema = new Schema<BotSession>({
    phone: { type: String, index: true },
    currentIntent: { type: Schema.Types.ObjectId, ref: "BotIntent" },
    vars: { type: [SessionVarSchema], required: false, default: [] },
    is_active: { type: Boolean, default: true },
}, {
    timestamps: true
});

export default model("BotSession", BotSessionSchema, "sessions");
