import { Schema, model } from "mongoose";

export interface BotIntent {
    tag: string,
    pattern: string[], // From Self.tag
    variables: string[], // From BotEntity.code
    response: string[],
    response_options_from_commerce?: {
        response_code: string, // From BotEntity.code
        response_options_type?: "list" | "button"
    },
    response_options: string[], // From Self.tag
    next_tags: string[], // From waiting || Self.tag
    response_options_type?: "list" | "button"
}

const ResponseOptionsFromCommerceSchema = new Schema({
    response_code: String,
    response_options_type: { type: String, enum: ["list", "button"]}
});

export const BotIntentSchema = new Schema<BotIntent>({
    tag: { type: String, index: true, unique: true },
    pattern: { type: [String], default: [] },
    variables: { type: [String], default: [] },
    response: { type: [String], default: [] },
    response_options_from_commerce: { type: ResponseOptionsFromCommerceSchema, required: false },
    response_options: { type: [String], default: [] },
    response_options_type: { type: String, enum: ["list", "button"], required: false},
    next_tags: { type: [String], default: []}
});

export default model("BotIntent", BotIntentSchema);
