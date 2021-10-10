import { PubSub } from "graphql-subscriptions";
import {
  ConsumerStream,
  KafkaConsumer,
  Producer,
  ProducerStream,
} from "node-rdkafka";

import { ErrorCodes } from "../../domain";
import {
  iLogger,
  iPubSub,
  iPubSubConstructorArgs,
  PubSubChannel,
  PubSubPayload,
  SenderServer,
} from "../interfaces";
import { genRandomString } from "../utils/genRandomString";

export class PubSubHandler implements iPubSub {
  private readonly TAG = "***-> PubSubHandler: ";
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
        "group.id": "kafka",
        "client.id": `${this._MAIN_TOPIC}:${genRandomString(5)}`,
        "metadata.broker.list": args.host,
      },
      {},
      {
        topics: [this._MAIN_TOPIC, ...(args.topics || [])],
      }
    );

    this._kafkaConsumer.on("data", ({ topic, timestamp, value, ...rest }) => {
      console.log("\n\n***-> REST: ", rest, "\n");
      this._logger.log({
        type: "DEBUG",
        tag: this.TAG,
        msg:
          `topic: ${topic} timestamp: ${new Date(timestamp).toISOString()}` +
          "\n" +
          value.toString(),
      });
      this.listenExternalPubSub(JSON.parse(value.toString()));
    });
  }

  publish(
    channel: PubSubChannel,
    payload: PubSubPayload<Record<string, unknown>>,
    sender: SenderServer = "SelfGraphQLSubscrition"
  ): void {
    switch (sender) {
      case "SelfGraphQLSubscrition":
        this._pubsub.publish(channel, payload);
        break;
      case "ExternalPubSubBroker":
        break;
    }
  }

  async listenExternalPubSub(payload: unknown): Promise<void> {
    // console.log("***-> Datos listos a procesar: ", payload);
  }
}
