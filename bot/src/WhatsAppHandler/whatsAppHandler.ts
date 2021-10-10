import { create, CatchQR, Whatsapp, CreateConfig, StatusFind } from "venom-bot";
import fs from "fs";
import path from "path";
import { iLogger } from "src/interfaces/logger.interface";
import { iPubSub } from "src/interfaces/pubSub.interface";
import { WhatsAppHandlerContructorArgs } from "./whatsAppHandler.interface";
import { iBot } from "../interfaces/bot.interface";
import { iWhatsappHandler } from "../interfaces/whatsappHandler.interface";

/**
 * HANDLER OF WHATSAPP: VENOM-BOT
 *  - https://orkestral.github.io/venom/index.html
 *  - https://orkestral.github.io/venom/modules.html
 */
export class WhatsAppHandler implements iWhatsappHandler {

    private readonly TAG = "***-> Whatsapp Handler: "

    client!: Whatsapp;
    bot: iBot
    logger: iLogger;
    pubSub: iPubSub;
    phoneNumber: string;

    constructor({ phoneNumber, logger, pubSub, bot }: WhatsAppHandlerContructorArgs) {
        this.phoneNumber = phoneNumber;
        this.logger = logger;
        this.pubSub = pubSub;
        this.bot = bot;
        const config: CreateConfig = {
            logQR: false,
            disableSpins: true,
            disableWelcome: true,
            autoClose: 0,
            createPathFileToken: true
        };
        create(phoneNumber, this.genQrImage, this.statusFind, config)
            .then(client => this.asignEvents(client))
            .catch(error => this.logger.log({
                type: "ERROR",
                tag: this.TAG + this.phoneNumber + "\n",
                msg: error.meessage
            }));
    }

    public async start(): Promise<string> {
        this.client.sendMessageOptions("573183919187@c.us", "Mensaje", {
            quotedMessageId: "reply",
        });
        return "Handler Stopped";
    }

    public async getStatus(): Promise<string> {
        const status = await this.client.getChatById("573207284198@c.us");
        return JSON.stringify(status);
    }

    public async reconect(): Promise<string> {
        return "Handler Stopped";
    }

    public async stop(): Promise<string> {
        return "Handler Stopped";
    }

    /**
     * 
     * @param status 
     * @param session 
     *  - https://orkestral.github.io/venom/modules.html#statusfind
     */
    private statusFind: StatusFind = (status, session) => {

        // Return 
        // isLogged                 || notLogged             || browserClose
        // qrReadSuccess            || qrReadFail            || autocloseCalled 
        // desconnectedMobile       || deleteToken           || chatsAvailable
        // deviceNotConnected       || serverWssNotConnected || noOpenBrowser
        // Create session wss return "serverClose" case server for close
        this.logger.log({
            tag: this.TAG,
            type: "DEBUG",
            msg: `***-> Notification: (${session}) ` + status
        });
        this.pubSub.publish<{
            status: string,
            flag: string
        }>({
            event: "CONNECTION_STATUS",
            data: {
                status,
                flag: "***-> statusFind"
            }
        });
    }

    private genQrImage: CatchQR = async (...[base64Qr, , attempts]): Promise<void> => {

        const expression = new RegExp(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        const matches = base64Qr.match(expression);

        if (matches?.length !== 3) {
            throw new Error("Invalid input string");
        }

        // const type = matches[1];
        const data = Buffer.from(matches[2], "base64");

        fs.writeFile(
            path.join(__dirname, "../../public/qr-codes/", `${this.phoneNumber}.png`),
            data, "binary",
            (err) => {
                if (err) {
                    this.logger.log({
                        tag: this.TAG + this.phoneNumber,
                        type: "ERROR",
                        msg: err.message
                    });
                }
            });
        this.pubSub.publish<{
            attempts: number,
            image: string
        }>({
            event: "REGEN_QR",
            data: {
                attempts,
                image: `${this.phoneNumber}.png`
            }
        });
    }

    private async asignEvents(client: Whatsapp): Promise<void> {

        this.client = client;

        this.client.onIncomingCall(async (call) => {
            console.log("***-> Llamada entrante: ", call);
            this.client.sendText(call.peerJid, "Lo siento, Ahora no puedo recibir llamadas.");
        });

        this.client.onMessage((message) => {
            if (!message.from.includes("status@broadcast") && !message.fromMe && message.isGroupMsg === false) {
                this.bot.getResponse(message.from, message.body, async (response) => {
                    try {

                        const buttons = [
                            {
                                buttonId: "id1",
                                type: 1,
                                buttonText: {
                                    displayText: "😋 Hacer un pedido"
                                }
                            },
                            {
                                buttonId: "id2",
                                type: 1,
                                buttonText: {
                                    displayText: "🕧 Conocer ubicación y horarios"
                                }
                            }
                        ];

                        const list = [{
                            title: "Carnes",
                            description: "description", rowId:"id1",
                            rows: [
                                {
                                    title: "Carne Asada",
                                    description: "Made with Carne",
                                },
                                {
                                    title: "Ravioli Lasagna",
                                    description: "Made with layers of frozen cheese",
                                }
                            ]
                        },
                        {
                            title: "Jugos",
                            description: "description", rowId:"id2",
                            rows: [
                                {
                                    title: "Limonada",
                                    description: "Made with limones",
                                },
                                {
                                    title: "Coco",
                                    description: "Made with Cocos",
                                }
                            ]
                        }
                        ];

                        console.log("***-> Respondiendo a: ", message.from, "\Message: ", message.body);
                        await this.client.sendText(message.from, response);
                        await this.client.sendListMenu(message.from, "Title", "subTitle", "Description", "menu", list);
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        await this.client.sendButtons(message.from, "Este es nuestro menú", buttons as any, "¿Qué deseas Ver?");
                    } catch (error) {
                        console.log("***-> Ups error: ", error);
                        this.logger.log({
                            tag: this.TAG + this.phoneNumber,
                            type: "WARNING",
                            msg: "Oops! " + message.from + " " + (error as Error).message
                        });
                    }
                });
            }
        });

        this.bot.setMessageSender(async (to: string, message: string) => {
            try {
                await this.client.sendText(to, message);
            } catch (error) {
                console.log("***-> Error: ", error);
                this.logger.log({
                    tag: this.TAG + this.phoneNumber,
                    type: "ERROR",
                    msg: (error as Error).message
                });
            }
        });

        [
            "SIGINT",
            "exit",
            "SIGKILL",
            "SIGTERM",
            "SIGUSR1",
            "SIGUSR2"
        ].forEach(messageId => {
            process.on(messageId, async () => {
                console.log("***-> Lanzando senia: ", messageId);
                this.logger.log({
                    tag: this.TAG + this.phoneNumber,
                    type: "WARNING",
                    msg: "Closing session"
                });
                this.client.close()
                    .then(() => {
                        process.exit(0);
                    })
                    .catch(reason => {
                        console.log("***-> Ups! Close session error", reason);
                        process.exit(0);
                    });
            });
        });
    }
}

