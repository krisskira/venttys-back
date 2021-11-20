import { Schema, model } from "mongoose";
import { BotEntity } from "../../bot/domain/bot.entity";

export const BotEntitySchema = new Schema<BotEntity>({
    code: { type: String, index: true, unique: true },
    collectionName: { type: String, required: true },
    isSessionVar: Boolean,
    path: { type: [String], required: true, default: [] },
    defaultValue: {type: String, required: false},
    type: {
        type: String,
        enum: [
            "single",
            "object",
            "array",
            "array-object",
        ],
        default: "single",
        required: true
    }
});

export default model("BotEntity", BotEntitySchema, "entities");
