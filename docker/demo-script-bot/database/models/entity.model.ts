import { Schema, model } from "mongoose";

export interface BotEntity {
    code: string,
    collection?: string,
    path: string,
    isSessionVar: boolean,
}

const BotEntitySchema = new Schema<BotEntity>({
    code: { type: String, index: true, unique: true },
    collection: String,
    isSessionVar: Boolean,
    path: String
});

export default model("BotEntity", BotEntitySchema);
