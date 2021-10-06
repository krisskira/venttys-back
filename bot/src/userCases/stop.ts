import { Request, Response } from "express";
import { WhatsAppHandler } from "src/WhatsAppHandler/whatsAppHandler";

export const stop = async ( req: Request, res: Response): Promise<void> => {
    const wh: WhatsAppHandler = req.app.get("WH");
    res.send("Stop proceso: "+ await wh.stop());
};