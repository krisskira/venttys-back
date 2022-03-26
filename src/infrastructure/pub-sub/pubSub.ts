import { PubSub, PubSubEngine } from "graphql-subscriptions";

import {
  Events,
  iLogger,
  iPubSub,
  iPubSubConstructorArgs,
  PublishMethod,
  PubSubChannel,
  PubSubPayload,
} from "../interfaces";

export class PubSubHandler implements iPubSub {
  private readonly TAG = "PubSubHandler";
  private readonly _MAIN_TOPIC = "venttys_graphql_api";
  private readonly _pubsub = new PubSub();
  private readonly _logger: iLogger;

  constructor(logger: iLogger) {
    this._logger = logger;
  }

  getPubSub(): PubSubEngine {
    return this._pubsub;
  }

  publish<T>(
    channel: PubSubChannel,
    payload: PubSubPayload<T>,
    sender: PublishMethod = "SelfGraphQLSubscrition"
  ): void {
    switch (sender) {
      case "SelfGraphQLSubscrition":
        this._pubsub.publish(channel, {
          [channel]: { type: payload.event, data: payload },
        });
        break;
      case "ExternalPubSubBroker":
        this.externalPublish(payload);
        break;
    }
  }

  private async externalPublish<T>(args: PubSubPayload<T>): Promise<void> {
    const data: PubSubPayload<unknown> = {
      sender: args.sender || this._MAIN_TOPIC,
      to: args.to,
      event: args.event,
      data: args.data,
    };
    const payload = Buffer.from(JSON.stringify(data));
  }

  private async onListenExternalPubSubBroker<T>(
    payload: PubSubPayload<T>
  ): Promise<void> {
    if (payload.sender === this._MAIN_TOPIC) return;
    switch (payload.event) {
      case Events.STATUS:
      case Events.CONNECTION_STATUS:
        this.publish<unknown>(
          PubSubChannel.onWhatsAppEvent,
          {
            to: payload.to,
            event: Events.STATUS,
            sender: payload.sender,
            data: payload.data,
          },
          "SelfGraphQLSubscrition"
        );
        break;

      case Events.QR_REGEN:
        this.publish<unknown>(
          PubSubChannel.onWhatsAppEvent,
          {
            to: payload.to,
            event: Events.STATUS,
            sender: payload.sender,
            data: payload.data,
          },
          "SelfGraphQLSubscrition"
        );
        break;

      default:
        this._logger.log({
          tag: this.TAG,
          type: "INFO",
          msg:
            "Kafka message not published:\n" + JSON.stringify(payload) + "\n",
        });
        break;
    }
  }
}
