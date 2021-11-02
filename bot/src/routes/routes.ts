import { Router } from "express";
import { DispatchEvent, Events } from "../interfaces/pubSub.interface";
import { start, stop, reconnect, status, getStatusEventUserCase, setReconnectEventUserCase, getQRRegenEventUserCase } from "../userCases";

export const router = Router();
router.get("/start", start);
router.get("/stop", stop);
router.get("/reconect", reconnect);
router.get("/status", status);

export const dispathEvents: DispatchEvent = ({ event, payload, context }) => {
    console.log("***-> Evento: ", event);
    console.log("***-> payload: ", payload.data);
    switch (event) {
    case Events.CONNECTION_STATUS:
    case Events.STATUS:
        getStatusEventUserCase({context, payload});
        break;
    case Events.QR_REGEN:
        getQRRegenEventUserCase({context, payload});
        break;
    case Events.RECONNECT:
        setReconnectEventUserCase({context, payload});
        break;
    default:
        console.log("***-> Dispara el evento: ", event);
        console.log("***-> Parametros: ", {context, payload});
    }
};