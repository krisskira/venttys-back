export interface BotEntity {
    code: string,
    collectionName: string,
    path: string[],
    isSessionVar: boolean,
    defaultValue?: string,
    fromMathOperations?: operation[]
    type: "single" | "object" | "array" | "array-object"
}

interface operation {
    vars: string[]
    operation: "+" | "-" | "*" | "/"
}