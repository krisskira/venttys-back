import { EventEmitter } from "events";
import { iLogger } from "../interfaces/logger.interface";
import { Bot, BotButtonOption as BotOptionButton, BotListOption as BotOptionList } from "../interfaces/bot.interface";
import { IntentsHandlerRepository } from "./repository/intents-handler";
import { ProductOwnerRepository } from "../interfaces/commerce.repository.interface";

import { NOTIFICATION_TAG } from "./domain/bot-intent.entity";

export class StaticBot<TCommerce, TData> implements Bot {

    private readonly TAG = "Static Bot";
    private readonly intentResolver: IntentsHandlerRepository;
    private readonly commercePhoneNumber: string;
    private readonly logger: iLogger;
    private readonly emiterOnSpeak = new EventEmitter();
    private readonly commerceRepository: ProductOwnerRepository<TCommerce, TData>;

    constructor(commerceRepository: ProductOwnerRepository<TCommerce, TData>, intentHandler: IntentsHandlerRepository, logger: iLogger) {
        this.commercePhoneNumber = commerceRepository.phoneNumber;
        this.logger = logger;
        this.intentResolver = intentHandler;
        this.commerceRepository = commerceRepository;
        this.commerceRepository.onEventListen(async (customerPhoneNumber, data) => {
            this.logger.log({
                tag: this.TAG,
                type: "DEBUG",
                msg: "***-> Run OnEventListen"
            });
            const intent = await this.intentResolver.botQueryByTag({
                customerPhoneNumber,
                pattern: NOTIFICATION_TAG
            });
            const message = intent.response.join("\n");
            this.emiterOnSpeak.emit("Speak", customerPhoneNumber, message, data);
        });
    }
    setOnSpeakEvent(event: (customerPhone: string, messageContent: string, data: TData) => void): void {
        this.emiterOnSpeak.addListener("Speak", event);
    }

    async toAsk(
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
            response: responseOptionsFromCommerce = [],
            groupBy: listItemsGroupBy = ""
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
                if (responseOptionTypeFromCommerce) {
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
                        const defaultTitle = "Seleccione una opción";

                        if (typeof responseOption === "string") {
                            return {
                                title: defaultTitle,
                                rows: [{ title: `${responseOption}`, description: "text" }]
                            };
                        }

                        const listItem = (responseOption as unknown as Array<Record<string, string | number>>)
                            .reduce((acc, item) => {
                                const option = { ...acc, ...item };
                                return { ...option };
                            }, {} as Record<string, string | number>);

                        const title = `${listItem[listItemsGroupBy] || defaultTitle}`;
                        console.log("***-> Delete: ", delete listItem[listItemsGroupBy]);

                        console.log("***->" + listItemsGroupBy, "\nTitle", title, "\nContent:", listItem);

                        const [keyTitle, ...keyContent] = Object.keys(listItem);
                        const description = keyContent.map((key) => listItem[key]).join(".\n");
                        return {
                            title,
                            rows: [{ title: `${listItem[keyTitle]}`, description: description }]
                        };
                    })
                    .reduce((list, item) => {
                        const index = list.findIndex(_item => _item.title === item.title);
                        if (index >= 0) {
                            list[index].rows = [...list[index].rows, ...item.rows];
                        } else {
                            list = [...list, item];
                        }
                        return list;
                    }, [] as BotOptionList[]);
                listOptions = [...listOptions, ...commercelistOptions];
                break;
        }

        responder({
            title: messageTitle,
            subTitle: messageSubTitle
        }, listButtons, listOptions);
    }

}