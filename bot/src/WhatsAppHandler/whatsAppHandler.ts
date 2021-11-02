import { create, CatchQR, Whatsapp, CreateConfig, StatusFind } from "venom-bot";
import fs from "fs";
import path from "path";
import { iLogger } from "../interfaces/logger.interface";
import { Events, iPubSub } from "../interfaces/pubSub.interface";
import { WhatsAppHandlerContructorArgs } from "./whatsAppHandler.interface";
import { iBot } from "../interfaces/bot.interface";
import { iWhatsappHandler } from "../interfaces/whatsappHandler.interface";

/**
 * HANDLER OF WHATSAPP: VENOM-BOT
 *  - https://orkestral.github.io/venom/index.html
 *  - https://orkestral.github.io/venom/modules.html
 */
export class WhatsAppHandler implements iWhatsappHandler {
    private readonly TAG = "WhatsAppHandler";

    client!: Whatsapp;
    bot: iBot;
    logger: iLogger;
    pubSub: iPubSub;
    phoneNumber: string;

    constructor({
        phoneNumber,
        logger,
        pubSub,
        bot,
    }: WhatsAppHandlerContructorArgs) {
        this.phoneNumber = phoneNumber;
        this.logger = logger;
        this.pubSub = pubSub;
        this.bot = bot;
        const config: CreateConfig = {
            logQR: false,
            disableSpins: true,
            disableWelcome: true,
            autoClose: 0,
            createPathFileToken: true,
        };
        create(phoneNumber, this.genQrImage, this.statusFind, config)
            .then((client) => this.asignEvents(client))
            .catch((error) =>
                this.logger.log({
                    type: "ERROR",
                    tag: this.TAG,
                    msg: `[${this.phoneNumber}] ${error.meessage}`,
                })
            );
    }

    public async start(): Promise<string> {
        await this.client.initialize();
        return "Completed";
    }

    public async getStatus(): Promise<string> {
        const connected = await this.client.isConnected();
        const logged = await this.client.isLoggedIn();
        return JSON.stringify({ connected, logged });
    }

    public async reconect(): Promise<string> {
        const status = await this.client.restartService();
        return status ? "Completed" : "Fail";
    }

    public async stop(): Promise<string> {
        const status = await this.client.close();
        return status ? "Completed" : "Fail";
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
            msg: `***-> Notification: (${session}) ` + status,
        });
        this.pubSub.publish<{
            status: string;
            flag: string;
        }>({
            event: Events.CONNECTION_STATUS,
            data: {
                status,
                flag: "***-> statusFind",
            },
        });
    };

    private genQrImage: CatchQR = async (
        ...[base64Qr, , attempts]
    ): Promise<void> => {
        const expression = new RegExp(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        const matches = base64Qr.match(expression);

        if (matches?.length !== 3) {
            throw new Error("Invalid input string");
        }

        // const type = matches[1];
        const data = Buffer.from(matches[2], "base64");

        fs.writeFile(
            path.join(__dirname, "../../public/qr-codes/", "code.png"),
            data,
            "binary",
            (err) => {
                if (err) {
                    this.logger.log({
                        tag: this.TAG + this.phoneNumber,
                        type: "ERROR",
                        msg: err.message,
                    });
                }
            }
        );

        this.pubSub.publish<{
            attempts: number;
            image: string;
            qr: string;
        }>({
            event: Events.QR_REGEN,
            data: {
                attempts,
                image: "public/qr-codes/code.png",
                qr: base64Qr,
            },
        });
    };

    private async asignEvents(client: Whatsapp): Promise<void> {
        this.client = client;
        this.pubSub.setWhatsappInstance(client);

        this.client.onIncomingCall(async (call) => {
            this.client.sendText(
                call.peerJid,
                "Lo siento, Ahora no puedo recibir llamadas."
            );
        });

        this.client.onMessage((message) => {
            if (
                !message.from.includes("status@broadcast") &&
                !message.fromMe &&
                message.isGroupMsg === false
            ) {
                this.bot.getResponse(
                    message.from,
                    message.body,
                    async (
                        response = undefined,
                        buttons = undefined,
                        list = undefined
                    ) => {
                        try {
                            if (buttons) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                await this.client.sendButtons(
                                    message.from,
                                    response || "",
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    buttons as any,
                                    "Por favor para continuar selecciona una de las siguientes opciones\n👇👇👇"
                                );
                            } else if (list) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                await this.client.sendListMenu(
                                    message.from,
                                    response || "",
                                    "",
                                    "Ver opciones",
                                    "Ver opciones",
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    list as any
                                );
                            } else {
                                await this.client.sendText(message.from, response || "");
                            }
                        } catch (error) {
                            this.logger.log({
                                tag: this.TAG,
                                type: "WARNING",
                                msg: `Oops! [${this.phoneNumber}]\n${message.from}\n${(error as Error).message}`,
                            });
                        }
                    }
                );
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
                    msg: (error as Error).message,
                });
            }
        });

        ["SIGINT", "exit", "SIGKILL", "SIGTERM"].forEach(async (messageId) => {
            process.on(messageId, async () => {
                this.logger.log({
                    tag: this.TAG,
                    type: "WARNING",
                    msg: `[${this.phoneNumber}] Closing session`,
                });
                await this.client.close();
                process.exit(0);
            });
        });
    }
}
