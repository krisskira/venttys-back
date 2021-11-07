import { WistonLogger } from "../logger/wiston.logger";
import initMongoDatabase from "./database";
import { config } from "dotenv";
import { intents } from "./data/intents.data";
import { entities } from "./data/entities.data";
import IntentModel from "./models/intent.model";
import BotModel from "./models/bot.model";
import EntityModel from "./models/entity.model";
import { Schema } from "mongoose";

config();

const logger = new WistonLogger("development");

initMongoDatabase(process.env.DB_CONNECTION_STRING || "", logger)
    .then(async () => {
        const intentsArray: Schema.Types.ObjectId[] = [];

        for (let i = 0; i < intents.length; i++) {
            const intentModel = new IntentModel(intents[i]);
            await intentModel.save();
            intentsArray.push(intentModel._id);
        }

        for (let i = 0; i < entities.length; i++) {
            const entityModel = new EntityModel(entities[i]);
            await entityModel.save();
        }

        const bot = new BotModel({
            intents: intentsArray,
            default: intentsArray[0]
        });
        await bot.save();

    })
    .catch(console.error);


