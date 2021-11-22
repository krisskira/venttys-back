import { create, CatchQR, Whatsapp, CreateConfig, StatusFind } from "venom-bot";
import fs from "fs";
import path from "path";
import { iLogger } from "../interfaces/logger.interface";
import { Events, iPubSub } from "../interfaces/pubSub.interface";
import { WhatsAppHandlerContructorArgs } from "./whatsAppHandler.interface";
import { Bot } from "../interfaces/bot.interface";
import { iWhatsappHandler } from "../interfaces/whatsappHandler.interface";

/**
 * HANDLER OF WHATSAPP: VENOM-BOT
 *  - https://orkestral.github.io/venom/index.html
 *  - https://orkestral.github.io/venom/modules.html
 */
export class WhatsAppHandler implements iWhatsappHandler {
    private readonly TAG = "WhatsAppHandler";

    client!: Whatsapp;
    bot: Bot;
    logger: iLogger;
    pubSub: iPubSub;
    commercePhoneNumber: string;

    constructor(args: WhatsAppHandlerContructorArgs) {
        this.bot = args.bot;
        this.logger = args.logger;
        this.pubSub = args.pubSub;
        this.commercePhoneNumber = args.commercePhoneNumber;
        this.pubSub.setWhatsappInstance(this);
    }

    public async start(): Promise<void> {
        const config: CreateConfig = {
            logQR: true,
            disableSpins: true,
            disableWelcome: true,
            autoClose: 0,
            createPathFileToken: true,
            folderNameToken: `tokens/${this.commercePhoneNumber}`
        };
        const client = await create(this.commercePhoneNumber, this.genQrImage, this.statusFind, config);
        this.asignEvents(client);
    }

    public async getStatus(): Promise<{ connected: boolean, logged: boolean }> {
        const [connected, logged] = await Promise.all([
            this.client.isConnected(),
            this.client.isLoggedIn()
        ]);
        return { connected, logged };
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
            msg: `Whatsapp Status: (${session}) ` + status,
        });
        this.pubSub.publish<{
            status: string;
        }>({
            event: Events.CONNECTION_STATUS,
            data: {
                status
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
        const filename = this.commercePhoneNumber.replace(/\+/, "phone_") + ".png";
        fs.writeFile(
            path.join(__dirname, "../", "../", "./public/", filename),
            data,
            "binary",
            (err) => {
                if (err) {
                    this.logger.log({
                        tag: this.TAG,
                        type: "ERROR",
                        msg: `[${this.commercePhoneNumber}]: ` + err.message,
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
                image: `public/${filename}`,
                qr: base64Qr,
            },
        });
    };

    private async asignEvents(client: Whatsapp) {
        this.client = client;
        this.bot.setOnSpeakEvent((customerPhone: string, messageContent: string, data: unknown) => {
            this.logger.log({
                tag: this.TAG,
                type: "DEBUG",
                msg: `Bot said: ${messageContent}.\nTo: ${customerPhone}\n` +
                    `Additional data: ${JSON.stringify(data)}`
            });
            client.sendText(customerPhone, messageContent)
                .catch(error => {
                    this.logger.log({
                        tag: this.TAG,
                        type: "ERROR",
                        msg: "Oops!\n" + JSON.stringify(error)
                    });
                });
        });

        this.client.onIncomingCall(async (call) => {
            this.client.sendText(
                call.peerJid,
                "Lo siento, Ahora no puedo recibir llamadas."
            );
        });

        this.client.onMessage((message) => {
            const { from, fromMe, isGroupMsg, body } = message;
            if (!from.includes("status@broadcast") && !fromMe && !isGroupMsg) {
                this.bot.toAsk(from, body,
                    async (response, buttons, list) => {
                        try {
                            if (list?.length || buttons?.length) {
                                if (list?.length) {
                                    await this.client.sendListMenu(
                                        from,
                                        response.title,
                                        "",
                                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                        response.subTitle!,
                                        "Opciones de menu",
                                        list
                                    );
                                    if (buttons?.length) {
                                        await this.client.sendButtons(
                                            from,
                                            "También puedes",
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            buttons as any,
                                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                            "👇👇👇"
                                        );
                                    }
                                } else {
                                    await this.client.sendButtons(
                                        from,
                                        response.title,
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        buttons as any,
                                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                        response.subTitle!
                                    );
                                }
                            } else {
                                await this.client.sendText(from, response.title);
                            }

                        } catch ({ message = "", text = "", ...error }) {
                            console.log(error);
                            this.logger.log({
                                tag: this.TAG,
                                type: "ERROR",
                                msg:
                                    `Oops! [${this.commercePhoneNumber}]\n` +
                                    `Customer: ${from}\n` +
                                    `Error: ${message || text}`,
                            });
                        }
                    }
                );
            }
        });

        ["SIGINT", "SIGTERM"].forEach((messageId) => {
            process.on(messageId, async () => {
                this.logger.log({
                    tag: this.TAG,
                    type: "WARNING",
                    msg: `[${this.commercePhoneNumber}]Closing session`,
                });
                this.client.close().finally(() => process.exit(0));
            });
        });
    }
}
