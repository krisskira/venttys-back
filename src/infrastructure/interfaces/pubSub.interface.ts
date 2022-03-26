import { PubSubEngine } from "graphql-subscriptions";

export interface iPubSubConstructorArgs {
  host: string;
  topics?: string[];
}

export type PublishMethod = "SelfGraphQLSubscrition" | "ExternalPubSubBroker";

export enum PubSubChannel {
  onWhatsAppEvent = "onWhatsAppEvent",
}

export enum Events {
  STATUS = "SUBSC:TOPIC:WA:STATUS",
  QR_REGEN = "SUBSC:TOPIC:WA:QRREGEN",
  RECONNECT = "SUBSC:TOPIC:WA:RECONNECT",
  CLOSE_SECTION = "CLOSE_SESSION",
  END = "END",
  CONNECTION_STATUS = "CONNECTION_STATUS",
}

export interface PubSubPayload<T> {
  sender?: string;
  to?: string;
  event: Events;
  data: T;
}

export interface iPubSub {
  publish<Tdata>(
    channel: PubSubChannel,
    payload: PubSubPayload<Tdata>,
    publishMethod?: PublishMethod
  ): void;
  getPubSub(): PubSubEngine;
}
