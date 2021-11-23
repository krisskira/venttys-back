import { Schema, model } from "mongoose";
import { BotEntity, OperationMath } from "../../bot/domain/bot.entity";

const OperationMath = new Schema<OperationMath>({
    operation: {
        type: String,
        enum: ["+", "-", "*", "/"],
        required: true
    },
    vars: { type: [String], required: true },
}, { _id: false, versionKey: false });

export const BotEntitySchema = new Schema<BotEntity>({
    code: { type: String, index: true, unique: true },
    collectionName: { type: String, required: true },
    path: { type: [String], required: true, default: [] },
    defaultValue: { type: String, required: false },
    isSessionVar: { type: Boolean, default: false },
    fromMathOperations: { type: [OperationMath], required: false },
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
