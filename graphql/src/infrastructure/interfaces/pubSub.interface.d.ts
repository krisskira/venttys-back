// TODO: Pending by define the differents notifications types
export type NotificationType = "QRREGEN" | "NEW_ORDER";
export enum PubSubChannel {
  whatsappReconnect = "SUBSC:TOPIC:WA:RECONNECT",
  whatsappStatus = "SUBSC:TOPIC:WA:STATUS",
  whatsappOnQR = "SUBSC:TOPIC:WA:QRREGEN",
}

export type Notification<Tpayload> = {
  type: NotificationType;
  data: Tpayload;
};

export type PubSubPayload<Tpayload> = {
  [subscritionName: string]: Notification<Tpayload>;
};

export type SenderServer = "SelfGraphQLSubscrition" | "ExternalPubSubBroker";
export interface iPubSubConstructorArgs {
  host: string;
  topics?: string[];
}

export interface iPubSub {
  publish(
    channel: PubSubChannel,
    payload: PubSubPayload,
    sender?: SenderServer
  ): void;
  listenExternalPubSub<T>(payload: T): Promise<void>;
}
