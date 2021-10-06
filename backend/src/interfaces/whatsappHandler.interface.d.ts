export interface iWhatsappHandler {
    start():Promise<string>
    getStatus(): Promise<string> 
    reconect(): Promise<string> 
    stop():Promise<string> 
}