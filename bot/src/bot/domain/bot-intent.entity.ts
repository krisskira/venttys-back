export interface BotIntent  {
    tag: TagsToEndType | string,
    pattern: string[], // From Self.tag
    variables: string[], // From BotEntity.code
    response: string[],
    response_options_from_commerce?: {
        response_code: string, // From BotEntity.code
        response_options_type?: "list" | "button",
        response: string[] | Record<string, unknown>[],
        groupBy?: string; // Inner field to group
    },
    response_options: string[], // From Self.tag
    next_tags: string[], // From waiting || Self.tag
    session_var_to_save?: string, // From BotEntity.code
    response_options_type?: "list" | "button" | "single"
    groupBy?: string; // Inner field to group
}

export enum TagsToEnd {
    Completed = "Completed",
    Close = "Close",
    End = "End",
    NeedHuman = "NeedHuman",
}
export const BOT_TAG_DEFAULT = "Default";
export const BOT_TAG_WAITING = "waiting";
export const BOT_TAG_COMPLETED = "Completed";
export const NOTIFICATION_TAG = "NOTIFICATION_TAG";
export type TagsToEndType = | "Completed" | "Close" | "End" | "NeedHuman" | string;
export const BOT_TAGS_TO_END: TagsToEndType[] = [
    BOT_TAG_COMPLETED,
    "Close",
    "End",
    "NeedHuman",
    NOTIFICATION_TAG
];