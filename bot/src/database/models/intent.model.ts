import { Schema, model } from "mongoose";
import { BotIntent } from "../../bot/domain/bot-intent.entity";

const ResponseOptionsFromCommerceSchema = new Schema({
    response_code: String,
    response_options_type: { type: String, enum: ["list", "button"]},
    response: {type: [String], default: []},
    groupBy: {type: String, required: false}
});

export const BotIntentSchema = new Schema<BotIntent>({
    tag: { type: String, index: true, unique: true },
    pattern: { type: [String], default: [] },
    variables: { type: [String], default: [] },
    response: { type: [String], default: [] },
    response_options_from_commerce: { type: ResponseOptionsFromCommerceSchema, required: false },
    response_options: { type: [String], default: [] },
    response_options_type: { type: String, enum: ["list", "button"], required: false},
    session_var_to_save: {type: String, required: false},
    next_tags: { type: [String], default: []}
});

export default model("BotIntent", BotIntentSchema, "intents");
