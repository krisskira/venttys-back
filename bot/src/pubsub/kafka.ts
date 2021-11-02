import {
    ConsumerStream,
    KafkaConsumer,
    Producer,
    ProducerStream,
} from "node-rdkafka";
import { DispatchEvent, iPubSub, PubSubPayload, PubSubConstructorArgs } from "../interfaces/pubSub.interface";
import { iLogger } from "../interfaces/logger.interface";
import { genRandomString } from "../utils/genRandomString";
import { Whatsapp } from "venom-bot";

export class KafkaPubSub implements iPubSub {

    private readonly TAG = "KafkaPubSub";
    private readonly _MAIN_TOPIC = "venttys_graphql_api";

    private readonly _logger: iLogger;
    private readonly clientId: string;

    private _kafkaProducer!: ProducerStream;
    private _kafkaConsumer!: ConsumerStream;
    private _whatsappClient!: Whatsapp;

    constructor(args: PubSubConstructorArgs, logger: iLogger) {
        if (!args.host || !args.clientId) throw "bad_implementation";
        this._logger = logger;
        this.clientId = args.clientId;
        this.initProducer(args.host);
        this.initConsumer(args.host, args.topics || []);
        this.setEventListeners(args.dispath);
    }

    async setWhatsappInstance(client: Whatsapp): Promise<void> {
        this._whatsappClient = client;
    }

    async publish<T>(args: PubSubPayload<T>): Promise<void> {
        const data: PubSubPayload<unknown> = {
            sender: args.sender || this.clientId,
            to: args.to || this._MAIN_TOPIC,
            event: args.event,
            data: args.data
        };
        const payload = Buffer.from(JSON.stringify(data));
        this._kafkaProducer.write(payload, (error) => {
            if (error) {
                this._logger.log({
                    type: "ERROR",
                    tag: this.TAG,
                    msg: `[${this.clientId}] ` + error.message,
                });
            }
        });
    }

    private initProducer(host: string) {
        this._kafkaProducer = Producer.createWriteStream(
            {
                "client.id": `${this.clientId}:${genRandomString(5)}`,
                "metadata.broker.list": host
            },
            {}, { topic: this._MAIN_TOPIC }
        );
        this._kafkaProducer
            .on("error", (err) => {
                this._logger.log({
                    type: "ERROR",
                    tag: this.TAG + ":" + this.clientId,
                    msg: err.message,
                });
            })
            .on("close", () => {
                this._logger.log({
                    type: "WARNING",
                    tag: this.TAG + ":" + this.clientId,
                    msg: "Connection to Kafka was closed.",
                });
            });
    }

    private initConsumer(host: string, topics: string[]) {
        this._kafkaConsumer = KafkaConsumer.createReadStream(
            {
                "group.id": `kafka_${this.clientId}`,
                "client.id": `${this.clientId}:${genRandomString(5)}`,
                "metadata.broker.list": host,
            },
            {},
            {
                topics: [this._MAIN_TOPIC, ...(topics || [])],
            }
        );
    }

    private setEventListeners(dispatch: DispatchEvent) {
        this._kafkaConsumer.on("data", ({ topic, timestamp, value: bufferPayload }) => {
            const strPayload = bufferPayload.toString();
            const { to, event, data, sender } = <PubSubPayload<unknown>>JSON.parse(strPayload);
            if (to === this.clientId) {
                dispatch({
                    event,
                    payload: {
                        to,
                        event,
                        sender,
                        data,
                    },
                    context: {
                        logger: this._logger,
                        publish: this.publish,
                        whatsappClient: this._whatsappClient
                    }
                });
                this._logger.log({
                    type: "DEBUG",
                    tag: this.TAG,
                    msg:
                        `topic: ${topic} timestamp: ${new Date(timestamp).toISOString()}` +
                        "\n" + strPayload,
                });
            }
        });

        this._kafkaConsumer.consumer.on("event.error", (error) =>
            this._logger.log({
                type: "ERROR",
                tag: this.TAG,
                msg: error.message,
            })
        );

    }
}