import { dispatchEvents as dispath } from "./routes";
import { WhatsAppHandler } from "./WhatsAppHandler/whatsAppHandler";
import { KafkaPubSub } from "./pubsub/kafka";
import { WistonLogger } from "./logger/wiston.logger";
import { Environment } from "./interfaces/app.interface";
import { StaticBot } from "./bot/static.bot";
import { OrdersRepository } from "./bot/repository/ordes.repository";
import initMongoDatabase from "./database/database";
import { iLogger } from "./interfaces/logger.interface";
import { PubSubConstructorArgs } from "./interfaces/pubSub.interface";

export async function bootstrap(): Promise<void> {
    const {
        NODE_ENV: env = "production",
        PHONE: commercePhone = "",
        COMMERCE: commerceName = "",
        EXTERNAL_PUBSUB_SERVER: pubSubHost = "",
        DB_CONNECTION_STRING: databaseConnectionString = "",
    } = process.env;

    const pubSubOptions: PubSubConstructorArgs = {
        host: pubSubHost,
        topics: [],
        clientId: commercePhone,
        dispath,
    };

    const logger = new WistonLogger(<Environment>env);

    checkEnvVars({
        env,
        commercePhone,
        commerceName,
        pubSubHost,
        databaseConnectionString,
    }, logger);

    await initMongoDatabase(databaseConnectionString, logger);

    const pubSub = new KafkaPubSub(pubSubOptions, logger);
    const ordersGenerator = new OrdersRepository();
    const bot = new StaticBot(commercePhone, ordersGenerator, logger);
    const wh = new WhatsAppHandler({ phoneNumber: commercePhone, logger, pubSub, bot });

    wh.start().catch( error => logger.log({
        type: "ERROR",
        tag: "Bootstrap Func",
        msg: error.message
    }));
}

function checkEnvVars({
    commercePhone = "",
    pubSubHost = "",
    commerceName = "",
    databaseConnectionString = "",
    env = ""
}, logger: iLogger) {
    if (
        !commercePhone ||
    !pubSubHost ||
    !commerceName ||
    !databaseConnectionString
    ) {
        const errorMessage =
      "" +
      "\n***-> Bad implementation!!!\n" +
      `\tEnvironment: ${env}\n` +
      `\tPhone: ${commercePhone}\n` +
      `\tCommerce: ${commerceName}\n` +
      `\tpubSubHost: ${pubSubHost}\n` +
      `\Database: ${databaseConnectionString}\n`;
        logger.log({
            type: "ERROR",
            tag: "bootstrap",
            msg: errorMessage,
        });
        throw errorMessage;
    }
}
