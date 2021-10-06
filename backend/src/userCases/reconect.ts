import { Request, Response } from "express";
import { WhatsAppHandler } from "src/WhatsAppHandler/whatsAppHandler";

export const reconect = async ( req: Request, res: Response): Promise<void> => {
    const wh: WhatsAppHandler = req.app.get("WH");
    res.send("Reconectando el proceso: "+ await wh.reconect());
};