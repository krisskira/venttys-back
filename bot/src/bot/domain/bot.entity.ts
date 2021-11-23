export interface BotEntity {
    code: string,
    collectionName: string,
    path: string[],
    isSessionVar: boolean,
    defaultValue?: string,
    fromMathOperations?: OperationMath[]
    type: "single" | "object" | "array" | "array-object"
}

export interface OperationMath {
    vars: string[]
    operation: "+" | "-" | "*" | "/"
}
