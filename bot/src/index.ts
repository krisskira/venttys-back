import initMongoDatabase from "./database/database";
import { dispatchEvents as dispath } from "./routes";
import { WhatsAppHandler } from "./WhatsAppHandler/whatsAppHandler";
import { KafkaPubSub } from "./pubsub/kafka";
import { WistonLogger } from "./logger/wiston.logger";
import { Environment } from "./interfaces/app.interface";
import { StaticBot } from "./bot/static.bot";
import { iLogger } from "./interfaces/logger.interface";
import { PubSubConstructorArgs } from "./interfaces/pubSub.interface";
import { CommerceRepository } from "./bot/repository/commerce.repository";
import { IntentsHandler } from "./bot/repository/intents-handler";

export async function bootstrap(): Promise<void> {
    const {
        NODE_ENV: env = "production",
        PHONE: commercePhoneNumber = "",
        EXTERNAL_PUBSUB_SERVER: pubSubConnectionString = "",
        DB_CONNECTION_STRING: databaseConnectionString = "",
    } = process.env;
    const logger = new WistonLogger(<Environment>env);

    checkEnvVars({
        env,
        commercePhoneNumber,
        pubSubConnectionString,
        databaseConnectionString,
    }, logger);

    await initMongoDatabase(databaseConnectionString, logger);

    const pubSubOptions: PubSubConstructorArgs = {
        host: pubSubConnectionString,
        topics: [],
        clientId: commercePhoneNumber,
        dispath,
    };

    const pubSub = new KafkaPubSub(pubSubOptions, logger);
    const commerceRepository = new CommerceRepository(commercePhoneNumber, logger);
    const intentHandler = new IntentsHandler(commerceRepository, logger);
    const bot = new StaticBot(commerceRepository, intentHandler, logger);
    const wh = new WhatsAppHandler({ commercePhoneNumber, logger, pubSub, bot });

    await wh.start();

    logger.log({
        type: "INFO",
        tag: "Bootstrap Func",
        msg: `Whatsapp Bot is ready to listen from: ${commercePhoneNumber}`
    });
}

function checkEnvVars({
    env = "",
    pubSubConnectionString = "",
    commercePhoneNumber = "",
    databaseConnectionString = ""
}, logger: iLogger) {
    if (!commercePhoneNumber || !pubSubConnectionString || !databaseConnectionString) {
        const errorMessage = "" +
            "\n***-> Bad implementation!!!\n" +
            `\tEnvironment: ${env}\n` +
            `\tPhone: ${commercePhoneNumber}\n` +
            `\tpubSubHost: ${pubSubConnectionString}\n` +
            `\Database: ${databaseConnectionString}\n`;

        logger.log({
            type: "ERROR",
            tag: "bootstrap",
            msg: errorMessage,
        });

        throw errorMessage;
    }
}
