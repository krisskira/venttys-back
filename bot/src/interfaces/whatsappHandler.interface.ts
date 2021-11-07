export interface iWhatsappHandler {
    start():Promise<void>
    getStatus(): Promise<{
        connected: boolean,
        logged: boolean
    }>
    reconect(): Promise<string> 
    stop():Promise<string> 
}