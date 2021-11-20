import { WistonLogger } from "../logger/wiston.logger";
import initMongoDatabase from "./database";
import { config } from "dotenv";
import { intents } from "./data/intents.data";
import { entities } from "./data/entities.data";
import IntentModel from "./models/intent.model";
import BotModel from "./models/bot.model";
import EntityModel from "./models/entity.model";

config();

const logger = new WistonLogger("development");

initMongoDatabase(process.env.DB_CONNECTION_STRING || "", logger)
    .then(async () => {
        const bot = new BotModel({
            intents: [],
        });
        
        for (let i = 0; i < intents.length; i++) {
            const intentModel = new IntentModel(intents[i]);
            await intentModel.save();
            bot.intents.push(intentModel._id);
        }
        bot.default = bot.intents[0];

        for (let i = 0; i < entities.length; i++) {
            const entityModel = new EntityModel(entities[i]);
            await entityModel.save();
        }
       
        await bot.save();
        console.log("Bot is created.");
        process.exit(0);
    })
    .catch(console.error);


