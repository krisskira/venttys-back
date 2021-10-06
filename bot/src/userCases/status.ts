import { Request, Response } from "express";
import { DispatchEventController } from "../interfaces/pubSub.interface";
import { WhatsAppHandler } from "../WhatsAppHandler/whatsAppHandler";

export const status = async ( req: Request, res: Response): Promise<void> => {
    const wh: WhatsAppHandler = req.app.get("WH");
    res.send("Estado del proceso: "+ await wh.getStatus());
};

export const getStatusEventUserCase: DispatchEventController<unknown> = async (args) => {
    console.log("***-> UserCase :Payload: ", args.payload);
};