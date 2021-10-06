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

const PORT = process.env.PORT || 80;
const ENV = <Environment>(process.env.NODE_ENV || "production");
const PHONE = process.env.PHONE;
const COMMERCE = process.env.COMMERCE;
const pubSubHost = process.env.EXTERNAL_PUBSUB_SERVER;

if (!PHONE || !pubSubHost || !COMMERCE) {
    throw "\n***-> Bad implementation!!!\n";
}

const logger = new WistonLogger(ENV);

const pubSub = new KafkaPubSub({
    host: pubSubHost,
    topics: [],
    clientId: PHONE,
    dispath
}, logger);

const ordersGenerator = new OrdersRepository();
const bot = new StaticBot(PHONE, ordersGenerator, logger);
const wh = new WhatsAppHandler({ phoneNumber: PHONE, logger, pubSub, bot });

const app = express();
app.set("WH", wh);
app.set("PS", pubSub);
app.set("LOGGER", logger);
app.use(router);
app.use("/public", express.static(join(__dirname, "../public"), {
    index: PHONE + ".png"
}));

app.listen(PORT, () => {
    logger.log({
        type: "DEBUG",
        tag: `\n\n***-> WHATSAPP HANDLER: ${COMMERCE} ${PHONE}\n`,
        msg: `API: http://localhost:${PORT}/\n` +
            `QRCodes: http://localhost:${PORT}/public/qr-codes/${PHONE}.png\n\n`
    });
});