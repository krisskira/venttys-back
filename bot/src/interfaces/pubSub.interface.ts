import { Whatsapp } from "venom-bot";
import { iLogger } from "./logger.interface";

export interface iPubSub {
    publish<T>(args: PubSubPayload<T>): Promise<void>;
    setWhatsappInstance(client: Whatsapp):Promise<void>;
}

export interface PubSubConstructorArgs {
    host: string,
    clientId: string,
    topics: string[],
    dispath: DispatchEvent
}

export type DispatchEvent = <T>(args: iDispatchEventArgs<T>) => void

export interface iDispatchEventArgs<T> {
    event: Events,
    payload: PubSubPayload<T>,
    context: {
        logger: iLogger;
        publish: (args: PubSubPayload<unknown>) => Promise<void>;
        whatsappClient: Whatsapp;
    }
}

export interface PubSubPayload<T> {
    sender?: string,
    to?: string,
    event: Events,
    data: T
}

export enum Events {
    STATUS = "SUBSC:TOPIC:WA:STATUS",
    QR_REGEN = "SUBSC:TOPIC:WA:QRREGEN",
    RECONNECT = "SUBSC:TOPIC:WA:RECONNECT",
    CLOSE_SECTION = "CLOSE_SESSION",
    END = "END",
    CONNECTION_STATUS = "CONNECTION_STATUS",
}

export type DispatchEventController<T> = (args: DispatchEventControllerArgs<T>) => Promise<void>

export type DispatchEventControllerArgs<T> = {
    context: {
        logger: iLogger,
        whatsappClient: Whatsapp,
        publish: <T>(args: PubSubPayload<T>) => Promise<void>,
    },
    payload: T
}



