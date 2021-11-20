import mongoose from "mongoose";
import "./models";
import { iLogger } from "src/interfaces/logger.interface";

export default async function initMongoDatabase(databaseUri: string, logger: iLogger): Promise<void> {
    try {
        await mongoose.connect(databaseUri);
        logger.log({
            tag: "MongoInstance",
            type: "INFO",
            msg: "Connected to database was success."
        });
    } catch (error) {
        logger.log({
            tag: "MongoInstance",
            type: "ERROR",
            msg: (error as Error).message
        });
        process.exit(1);
    }
}
