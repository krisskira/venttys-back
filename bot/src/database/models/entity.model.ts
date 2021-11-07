import { Schema, model } from "mongoose";
import { BotEntity } from "../../bot/domain/bot.entity";

const BotEntitySchema = new Schema<BotEntity>({
    code: { type: String, index: true, unique: true },
    collectionName: String,
    isSessionVar: Boolean,
    path: String,
    default: {type: String, required: false}
});

export default model("BotEntity", BotEntitySchema, "entities");
