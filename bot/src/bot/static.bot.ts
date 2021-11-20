import { iLogger } from "src/interfaces/logger.interface";
import { iBot, BotButtonOption as BotOptionButton, BotListOption as BotOptionList } from "../interfaces/bot.interface";
import { CommerceRepository } from "./repository/commerce.repository";
import { IntentsHandlerRepository } from "./repository/intents-handler";

export class StaticBot implements iBot {

    private readonly intentResolver: IntentsHandlerRepository;
    private readonly commercePhoneNumber: string;
    private readonly logger: iLogger;

    constructor(commerceRepository: CommerceRepository, intentHandler: IntentsHandlerRepository, logger: iLogger) {
        this.commercePhoneNumber = commerceRepository.phoneNumber;
        this.logger = logger;
        this.intentResolver = intentHandler;
    }

    async getResponse(
        customerPhoneNumber: string,
        textCustomerQuery: string,
        responder: (
            message: {
                title: string,
                subTitle?: string
            },
            buttons?: BotOptionButton[],
            list?: BotOptionList[]
        ) => void): Promise<void> {

        const {
            response: responseMessage = [],
            response_options: responseOptions = [],
            response_options_from_commerce,
            response_options_type: responseOptionsType = "single",
        } = await this.intentResolver
            .botQueryByTag({
                pattern: textCustomerQuery,
                customerPhoneNumber
            });

        const {
            response_options_type: responseOptionTypeFromCommerce = undefined,
            response: responseOptionsFromCommerce = []
        } = response_options_from_commerce || {};

        let messageTitle = "";
        let messageSubTitle = "";
        const defaultSubTitle = "Por favor seleccione una de las siguiente opciones.";
        let listButtons: BotOptionButton[] = [];
        let listOptions: BotOptionList[] = [];
        let commercelistButtons: BotOptionButton[] = [];
        let commercelistOptions: BotOptionList[] = [];

        switch (responseOptionsType) {
            case "button":
            case "list":
                [messageTitle] = responseMessage;
                messageSubTitle = responseMessage.slice(1).join("\n") || defaultSubTitle;
                break;
            case "single":
            default:
                if(responseOptionTypeFromCommerce){
                    [messageTitle] = responseMessage;
                    messageSubTitle = responseMessage.slice(1).join("\n") || defaultSubTitle;
                } else {
                    messageTitle = responseMessage.join("\n");
                }
        }

        switch (responseOptionsType) {
            case "button":
                listButtons = responseOptions.map<BotOptionButton>(responseOption => ({
                    buttonText: {
                        displayText: responseOption
                    }
                }));
                break;
            case "list":
                // eslint-disable-next-line no-case-declarations
                const rows = responseOptions
                    .map<{ title: string, description?: string }>(responseOption => ({
                        title: responseOption,
                        description: undefined
                    }));
                listOptions = [{
                    title: messageTitle,
                    rows
                }];
                break;
        }

        switch (responseOptionTypeFromCommerce) {
            case "button":
                commercelistButtons = responseOptionsFromCommerce
                    .map<BotOptionButton>(responseOption => {
                        let displayText = "Invalid value";
                        if (typeof responseOption !== "string") {
                            displayText = Object.values(responseOption).map(value => `${value}`).join(", ");
                        }
                        return {
                            buttonText: {
                                displayText
                            }
                        };
                    });
                listButtons = [...listButtons, ...commercelistButtons];
                break;
            case "list":
                commercelistOptions = responseOptionsFromCommerce
                    .map<BotOptionList>(responseOption => {
                        console.log("***-> Objecto: ", responseOption);
                        if (typeof responseOption === "string") {
                            return {
                                title: "Seleccione una opción",
                                rows: [{ title: `${responseOption}`, description: "text" }]
                            };
                        }
                        // let rows: BotOptionList["rows"] = [];
                        // rows = responseOptions
                        //     .map<{ title: string, description?: string }>(responseOption => ({
                        //         title: responseOption,
                        //         description: undefined
                        //     }));
                        //  const 
                        return {
                            title: "Titulo de la categoria",
                            rows: []
                        };
                    });
                //.reduce( (a,i) => [...a, i], [] as any[]);
                listOptions = [...listOptions, ...commercelistOptions];
                break;
        }

        responder({
            title: messageTitle,
            subTitle: messageSubTitle
        }, listButtons, listOptions);

        // let options: BotOptionList | BotOptionButton[];

        // if (responseOptions.length > 0) {
        //     if (responseOptionsType === "button") {
        //         options = responseOptions.map<BotOptionButton>((o: string) => ({
        //             buttonText: {
        //                 displayText: o,
        //             }
        //         })) as BotOptionButton[];

        //         if(responseOptionsFromCommerce.length){
        //             if(responseOptionTypeFromCommerce === "list"){
        //                 const listOptions = {
        //                     title: textMessage,
        //                     // eslint-disable-next-line @typescript-eslint/no-explicit-any
        //                     rows: responseOptionsFromCommerce.map((option: any) => ({
        //                         title: "Opcion From Commerce", //option,
        //                         description: "Descripcion por item from Commerce"
        //                     })),
        //                     description: "Descripcion 1 from Commerce"
        //                 } as BotOptionList;
        //                 responder(textMessage, options , listOptions);
        //             }else {
        //                 // TODO: Merchar las respuestas buttons desde el comercio 
        //                 // Con las existentes.
        //                 responder(textMessage, options, undefined);
        //             }
        //         } else {
        //             responder(textMessage, options , undefined);
        //         }
        //     }

        //     else if (responseOptionsType === "list") {
        //         // TODO: Mapear sobre la intentcion
        //         options = {
        //             title: textMessage,
        //             // eslint-disable-next-line @typescript-eslint/no-explicit-any
        //             rows: responseOptions.map((option: any) => ({
        //                 title: "Titulo lista From Intent", // option,
        //                 description: "Descripcion por item ",
        //             })),
        //             description: "Descripcion 1"
        //         } as BotOptionList;
        //         responder(textMessage, undefined, options);
        //     } else {
        //         responder(textMessage);
        //     }
        //     return;
        // } else if(responseOptionsFromCommerce.length){
        //     console.log("TODO: Si no tiene response options, verificar si tiene respuiestas desd comercio");
        // }
        // responder(textMessage);
    }

    // private sendMessage?: (to: string, message: string) => void;

    // setMessageSender(sendMessage: (to: string, message: string) => void): void {
    //     this.sendMessage = sendMessage;
    // }

    // private notifyChageOrderStatus(order: iOrder) {
    //     console.log("***-> Cambio de estado en una orden: ", order);
    //     if (this.sendMessage) {
    //         this.sendMessage("573183919187", "Cambios de estado en pedido");
    //     } else {
    //         throw "bad_implementation";
    //     }
    // }
}