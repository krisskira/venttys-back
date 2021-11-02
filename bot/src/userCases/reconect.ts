import { Request, Response } from "express";
import { DispatchEventController, Events } from "../interfaces/pubSub.interface";
import { WhatsAppHandler } from "../WhatsAppHandler/whatsAppHandler";

export const reconnect = async ( req: Request, res: Response): Promise<void> => {
    const wh: WhatsAppHandler = req.app.get("WH");
    res.send("Reconectando el proceso: "+ await wh.reconect());
};

export const setReconnectEventUserCase: DispatchEventController<unknown> = async (args) => {
    console.log("***-> UserCase :Reconnect: ", args.payload);
};

export const getQRRegenEventUserCase: DispatchEventController<unknown> = async (args) => {
    args.context.publish({
        event: Events.QR_REGEN,
        to: "venttys_graphql_api",
        data: args.payload
    });
};