import { iLogger } from "src/interfaces/logger.interface";
import { iBot, iBotButtonOption, iBotListOption } from "../interfaces/bot.interface";
import { iOrder, iOrderRepository } from "../interfaces/orders.repository.interface";
import { FixedIntentsHandler } from "./repository/fixed.intents.repository";

export class StaticBot implements iBot {

    private readonly intentResolver: FixedIntentsHandler;
    private readonly commercePhoneNumber: string;
    private readonly genOrders: iOrderRepository;
    private readonly logger: iLogger;
    private sendMessage?: (to: string, message: string) => void;

    constructor(context: string, genOrders: iOrderRepository, logger: iLogger) {
        this.commercePhoneNumber = context;
        this.genOrders = genOrders;
        this.logger = logger;
        this.intentResolver = new FixedIntentsHandler({
            context,
            logger
        });
        genOrders.listen(this.notifyChageOrderStatus);
    }

    setMessageSender(sendMessage: (to: string, message: string) => void): void {
        this.sendMessage = sendMessage;
    }

    async getResponse(clientPhoneNumber: string, query: string, responder: (message?: string, buttons?: iBotButtonOption[], list?: iBotListOption) => void): Promise<void> {
        // TODO:  Como se debe manejar la session del usuario?
        // Posible solucion, todas las respuestas dentro del la 
        // conversacion deberan de tene diferentes codigos.
        // responder("TODO: Respondiendo desde el bot");
        const botResponse = await this.intentResolver.botQueryByTag({ pattern: query, userPhoneNumber: clientPhoneNumber });
        const answer = botResponse.dialogResponse.response.join("\n");
        const answerOption = botResponse.dialogResponse.response_options; //?.join("\n") || "";
        let options: iBotListOption | iBotButtonOption[];

        if (answerOption.length > 0) {
            if (botResponse.dialogResponse.response_options_type === "button") {
                options = answerOption.map<iBotButtonOption>(options => ({
                    buttonText: {
                        displayText: options
                    }
                }));
                // TODO: add list on last function parameter
                responder(answer, options as iBotButtonOption[]);
            }

            else if (botResponse.dialogResponse.response_options_type === "list") {
                options = {
                    title: answer,
                    rows: answerOption.map( option  => ({
                        title: option
                    }))
                } as iBotListOption;
                responder(answer,undefined ,options);
            }
        }
        // TODO: Genera una orden.
        // this.genOrders.generate()
    }

    private notifyChageOrderStatus(order: iOrder) {
        console.log("***-> Cambio de estado en una orden: ", order);
        if (this.sendMessage) {
            this.sendMessage("573183919187", "Cambios de estado en pedido");
        } else {
            throw "bad_implementation";
        }
    }
}