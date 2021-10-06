import { iLogger } from "./logger.interface";

export interface iPubSub {
    publish<T>(args: iPayloadEvent<T>): Promise<void>;
}

export interface PubSubConstructorArgs {
    host: string,
    clientId: string,
    topics: string[],
    dispath: DispatchEvent
}

export type DispatchEvent = (args: iDispatchEventArgs) => void

export interface iDispatchEventArgs {
    event: Events,
    data: iPayloadEvent
}

export interface iPayloadEvent<T> {
    sender?: string,
    to?: string,
    event: Events,
    data: T
}

export type Events = "GET_STATUS" | "REGEN_QR" | "RECONNECT" | "CLOSE_SESSION" | "END" | "CONNECTION_STATUS";

// whatsappReconnect = "SUBSC:TOPIC:WA:RECONNECT",
// whatsappStatus = "SUBSC:TOPIC:WA:STATUS",
// whatsappOnQR = "SUBSC:TOPIC:WA:QRREGEN",

export type DispatchEventController<T> = (args:  DispatchEventControllerArgs<T>) => Promise<void>

export type DispatchEventControllerArgs<T> = {
    context: {
        logger: iLogger,
        publish: <T>(args: iPayloadEvent<T>) => Promise<void>,
    },
    payload: T
}



