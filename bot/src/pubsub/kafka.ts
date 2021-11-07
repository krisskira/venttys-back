import {
    ConsumerStream,
    KafkaConsumer,
    Producer,
    ProducerStream,
} from "node-rdkafka";
import { iPubSub, PubSubPayload, PubSubConstructorArgs, DispatchEventController } from "../interfaces/pubSub.interface";
import { iLogger } from "../interfaces/logger.interface";
import { genRamdonString } from "../utils/genRandomString";
import { iWhatsappHandler } from "src/interfaces/whatsappHandler.interface";

export class KafkaPubSub implements iPubSub {

    private readonly TAG = "KafkaPubSub";
    private readonly _MAIN_TOPIC = "venttys_graphql_api";

    private readonly _logger: iLogger;
    private readonly clientId: string;

    private _kafkaProducer!: ProducerStream;
    private _kafkaConsumer!: ConsumerStream;
    private _whatsappHandler!: iWhatsappHandler;

    constructor(args: PubSubConstructorArgs, logger: iLogger) {
        if (!args.host || !args.clientId) throw "bad_implementation";
        this._logger = logger;
        this.clientId = args.clientId;
        this.initProducer(args.host);
        this.initConsumer(args.host, args.topics || []);
        this.setEventListeners(args.dispath);
    }

    private initProducer(host: string) {
        this._kafkaProducer = Producer.createWriteStream(
            {
                "client.id": `${this.clientId}:${genRamdonString(5)}`,
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
                    msg: "Connection to kafka was closed.",
                });
            });
    }

    private initConsumer(host: string, topics: string[]) {
        this._kafkaConsumer = KafkaConsumer.createReadStream(
            {
                "group.id": `kafka_${this.clientId}`,
                "client.id": `${this.clientId}:${genRamdonString(5)}`,
                "metadata.broker.list": host,
            },
            {},
            {
                topics: [this._MAIN_TOPIC, ...(topics || [])],
            }
        );
    }

    async publish<T>(args: PubSubPayload<T>): Promise<void> {
        const data: PubSubPayload<T> = {
            ...args,
            sender: args.sender || this.clientId,
            to: args.to || this._MAIN_TOPIC,
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

    private setEventListeners(dispatch: DispatchEventController) {
        this._kafkaConsumer.on("data", ({ timestamp, value: bufferPayload }) => {
            type tdata = Record<string, unknown>;
            const strPayload = bufferPayload.toString();
            const { to, event, data, sender } = <PubSubPayload<tdata>>JSON.parse(strPayload);
            if (sender !== this.clientId) {
                this._logger.log({
                    type: "DEBUG",
                    tag: this.TAG,
                    msg: `timestamp: ${new Date(timestamp).toISOString()}\n${strPayload}`
                });
                dispatch<tdata>({
                    payload: {
                        to,
                        event,
                        sender,
                        data,
                    },
                    context: {
                        logger: this._logger,
                        publish: this.publish,
                        whatsappHandler: this._whatsappHandler
                    }
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

    async setWhatsappInstance(client: iWhatsappHandler): Promise<void> {
        this._whatsappHandler = client;
    }
}