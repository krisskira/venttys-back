import { Request, Response } from "express";
import { WhatsAppHandler } from "../WhatsAppHandler/whatsAppHandler";

export const start = async ( req: Request, res: Response): Promise<void> => {
    const wh: WhatsAppHandler = req.app.get("WH");
    res.send("Iniciando el proceso: " + await wh.start() );
};