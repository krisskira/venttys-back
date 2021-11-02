export interface iBotButtonOption {
    buttonText: {
        displayText: string
    }
}

export interface iBotListOption {
    title: string,
    description?: string,
    rows: {
        title: string,
        description?: string,
    }[]
}

export interface iBot {
    getResponse(context: string, query: string, responder: (message?: string, buttons?: iBotButtonOption[], list?: iBotListOption) => void)
    setMessageSender(sendMessage: (to: string, message: string) => void): void
}