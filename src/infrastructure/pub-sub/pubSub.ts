import { PubSub, PubSubEngine } from "graphql-subscriptions";
import {
  ConsumerStream,
  KafkaConsumer,
  Producer,
  ProducerStream,
} from "node-rdkafka";

import { ErrorCodes } from "../../domain";
import {
  Events,
  iLogger,
  iPubSub,
  iPubSubConstructorArgs,
  PublishMethod,
  PubSubChannel,
  PubSubPayload,
} from "../interfaces";
import { genRandomString } from "../utils/genRandomString";

export class PubSubHandler implements iPubSub {
  private readonly TAG = "PubSubHandler";
  private readonly _MAIN_TOPIC = "venttys_graphql_api";
  private readonly _pubsub = new PubSub();
  private readonly _kafkaProducer: ProducerStream;
  private readonly _kafkaConsumer: ConsumerStream;
  private readonly _logger: iLogger;

  constructor(args: iPubSubConstructorArgs, logger: iLogger) {
    if (!args.host) throw ErrorCodes.badImplementation;
    this._logger = logger;
    this._kafkaProducer = Producer.createWriteStream(
      {
        "client.id": `${this._MAIN_TOPIC}:${genRandomString(5)}`,
        "metadata.broker.list": args.host,
      },
      {},
      { topic: this._MAIN_TOPIC }
    );

    this._kafkaProducer
      .on("error", (err) => {
        this._logger.log({
          type: "ERROR",
          tag: this.TAG,
          msg: err.message,
        });
      })
      .on("close", () => {
        this._logger.log({
          type: "WARNING",
          tag: this.TAG,
          msg: "Connection to Kafka was closed.",
        });
      });

    this._kafkaConsumer = KafkaConsumer.createReadStream(
      {
        "group.id": `kafka_${this._MAIN_TOPIC}`,
        "client.id": `${this._MAIN_TOPIC}:${genRandomString(5)}`,
        "metadata.broker.list": args.host,
      },
      {},
      {
        topics: [this._MAIN_TOPIC, ...(args.topics || [])],
      }
    );

    this._kafkaConsumer.consumer.on("event.error", (error) =>
      this._logger.log({
        type: "ERROR",
        tag: this.TAG,
        msg: error.message,
      })
    );

    this._kafkaConsumer.on("data", ({ topic, timestamp, value }) => {
      this._logger.log({
        type: "DEBUG",
        tag: this.TAG,
        msg:
          `topic: ${topic} timestamp: ${new Date(timestamp).toISOString()}` +
          "\n" +
          value.toString(),
      });
      this.onListenExternalPubSubBroker(JSON.parse(value.toString()));
    });

    this._kafkaProducer.producer.setPollInterval(100);
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
    this._kafkaProducer.write(payload, (error) => {
      if (error) {
        this._logger.log({
          type: "ERROR",
          tag: this.TAG,
          msg: `[${args.sender}] ` + error.message,
        });
      }
    });
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
