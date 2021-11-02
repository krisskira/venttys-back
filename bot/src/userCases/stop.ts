import { Request, Response } from "express";
import { DispatchEventController } from "src/interfaces/pubSub.interface";
import { WhatsAppHandler } from "src/WhatsAppHandler/whatsAppHandler";

export const stop = async ( req: Request, res: Response): Promise<void> => {
    const wh: WhatsAppHandler = req.app.get("WH");
    res.send("Stop proceso: "+ await wh.stop());
};

export const setStopEventUserCase: DispatchEventController<unknown> = async (args) => {
    console.log("***-> UserCase :Stop: ", args.payload);
};