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
        this.bot = bot;
        this.pubSub = pubSub;
        this.pubSub.setWhatsappInstance(this);
    }

    public async start(): Promise<void> {
        return new Promise((resolve, reject) => {
            const config: CreateConfig = {
                logQR: true,
                disableSpins: true,
                disableWelcome: true,
                autoClose: 0,
                createPathFileToken: true,
                folderNameToken:`tokens/${this.phoneNumber}`
            };
            create(this.phoneNumber, this.genQrImage, this.statusFind, config)
                .then((client) => {
                    this.asignEvents(client)
                        .then(resolve)
                        .catch(reject);
                })
                .catch(reject);
        });
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
        const filename = this.phoneNumber.replace(/\+/, "phone_") + ".png";
        fs.writeFile(
            path.join(__dirname, "../","../","./public/", filename),
            data,
            "binary",
            (err) => {
                if (err) {
                    this.logger.log({
                        tag: this.TAG,
                        type: "ERROR",
                        msg: `[${this.phoneNumber}]: ` + err.message,
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

    private async asignEvents(client: Whatsapp): Promise<void> {
        this.client = client;
        this.client.onIncomingCall(async (call) => {
            this.client.sendText(
                call.peerJid,
                "Lo siento, Ahora no puedo recibir llamadas."
            );
        });
        this.client.onMessage((message) => {
            this.client.sendText(message.from, "OK");
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
                            await this.client.sendText(message.from, response || "");
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

        ["SIGINT", "SIGTERM"].forEach((messageId) => {
            process.on(messageId, async () => {
                this.logger.log({
                    tag: this.TAG,
                    type: "WARNING",
                    msg: `[${this.phoneNumber}] Closing session`,
                });
                this.client.close().finally( () => process.exit(0) );
            });
        });
    }
}
