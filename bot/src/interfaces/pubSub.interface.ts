import { iLogger } from "./logger.interface";
import { iWhatsappHandler } from "./whatsappHandler.interface";

export enum Events {
    STATUS = "SUBSC:TOPIC:WA:STATUS",
    QR_REGEN = "SUBSC:TOPIC:WA:QRREGEN",
    RECONNECT = "SUBSC:TOPIC:WA:RECONNECT",
    CLOSE_SECTION = "CLOSE_SESSION",
    END = "END",
    CONNECTION_STATUS = "CONNECTION_STATUS",
}

export interface PubSubPayload<T> {
    sender?: string,
    to?: string,
    event: Events,
    data: T
}

export type PubSubPublishFC = <T>(args: PubSubPayload<T>) => Promise<void>;

export interface iPubSub {
    publish: PubSubPublishFC;
    setWhatsappInstance(client: iWhatsappHandler):Promise<void>;
}

export interface PubSubConstructorArgs {
    host: string,
    clientId: string,
    topics: string[],
    dispath: DispatchEventController
}

export interface DispatchEventArgs<T> {
    payload: PubSubPayload<T>,
    context: {
        logger: iLogger;
        whatsappHandler: iWhatsappHandler;
        publish: PubSubPublishFC;
    }
}

export type DispatchEventController = <T>(args: DispatchEventArgs<T>) => Promise<void>

