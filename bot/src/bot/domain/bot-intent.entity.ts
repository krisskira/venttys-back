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
