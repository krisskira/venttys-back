import { DispatchEventController, Events } from "../interfaces/pubSub.interface";
import { getStatusEventUserCase, whatsappReconnectEventUserCase, whatsappStopEventUserCase } from "../userCases";

export const dispatchEvents: DispatchEventController = async ({ payload, context: { logger, publish, whatsappHandler } }) => {
    logger.log({
        type: "DEBUG",
        tag: "Router-Dispatcher",
        msg: JSON.stringify(payload)
    });
    switch (payload.event) {
    case Events.CONNECTION_STATUS:
    case Events.STATUS:
        getStatusEventUserCase({ whatsappHandler, publish, payload });
        break;
    case Events.RECONNECT:
        whatsappReconnectEventUserCase({ whatsappHandler, publish, payload });
        break;
    case Events.CLOSE_SECTION:
    case Events.END:
        whatsappStopEventUserCase({ whatsappHandler, publish, payload });
        break;
    }
};