import express from "express";
import { join } from "path";
import { dispathEvents as dispath, router } from "./routes";
import { WhatsAppHandler } from "./WhatsAppHandler/whatsAppHandler";
import { config as doEnv } from "dotenv";
import { KafkaPubSub } from "./pubsub/kafka";
import { WistonLogger } from "./logger/wiston.logger";
import { Environment } from "./interfaces/app.interface";
import { StaticBot } from "./bot/static.bot";
import { OrdersRepository } from "./bot/repository/ordes.repository";

doEnv();

const {
    PORT = 80,
    NODE_ENV: ENV = "production",
    PHONE,
    COMMERCE,
    EXTERNAL_PUBSUB_SERVER: pubSubHost,
} = process.env;

if (!PHONE || !pubSubHost || !COMMERCE) {
    throw (
        "\n***-> Bad implementation!!!\n" +
    `\tEnvironment: ${ENV}\n` +
    `\tPhone: ${PHONE}\n` +
    `\tCommerce: ${COMMERCE}\n` +
    `\tpubSubHost: ${pubSubHost}\n`
    );
}

const logger = new WistonLogger(<Environment>ENV);

const pubSub = new KafkaPubSub(
    {
        host: pubSubHost,
        topics: [],
        clientId: PHONE,
        dispath,
    },
    logger
);

const ordersGenerator = new OrdersRepository();
const bot = new StaticBot(PHONE, ordersGenerator, logger);
const wh = new WhatsAppHandler({ phoneNumber: PHONE, logger, pubSub, bot });

const app = express();
app.set("WH", wh);
app.set("PS", pubSub);
app.set("LOGGER", logger);
app.use(router);
app.use("/public", express.static(join(__dirname, "../public")));

app.listen(PORT, () => {
    logger.log({
        type: "DEBUG",
        tag: `\n\nWHATSAPP HANDLER:\n\t${COMMERCE} ${PHONE}`,
        msg:
      `\n\tAPI: http://localhost:${PORT}/` +
      `\n\tQRCodes: http://localhost:${PORT}/public/qr-codes/${PHONE}.png\n`,
    });
});
