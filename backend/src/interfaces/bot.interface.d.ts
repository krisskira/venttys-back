export interface iBot {
    getResponse(context: string, query: string, responder: (message: string) => void )
    setMessageSender(sendMessage: (to: string, message: string) => void ): void
}