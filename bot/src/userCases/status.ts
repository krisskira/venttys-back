import { Request, Response } from "express";
import { DispatchEventController, Events } from "../interfaces/pubSub.interface";
import { WhatsAppHandler } from "../WhatsAppHandler/whatsAppHandler";

export const status = async ( req: Request, res: Response): Promise<void> => {
    const wh: WhatsAppHandler = req.app.get("WH");
    res.send("Estado del proceso: "+ await wh.getStatus());
};

export const getStatusEventUserCase: DispatchEventController<unknown> = async (args) => {
    console.log("***-> UserCase :Status: ", args.payload);
    const [connected, logged] = await Promise.all([
        args.context.whatsappClient.isConnected(),
        args.context.whatsappClient.isLoggedIn()
    ]);
    args.context.publish({
        event: Events.STATUS,
        to: "venttys_graphql_api",
        data: {
            status: {
                connected,
                logged
            },
        } 
    });
};