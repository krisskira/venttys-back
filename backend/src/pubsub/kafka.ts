import {
    ConsumerStream,
    KafkaConsumer,
    Producer,
    ProducerStream,
} from "node-rdkafka";
import { DispatchEvent, iPubSub, iPayloadEvent, PubSubConstructorArgs } from "../interfaces/pubSub.interface";
import { iLogger } from "../interfaces/logger.interface";
import { genRandomString } from "../utils/genRandomString";

export class KafkaPubSub implements iPubSub {

    private readonly TAG = "***-> KafkaPubSub: ";
    private readonly _MAIN_TOPIC = "venttys_graphql_api";

    private readonly _logger: iLogger;
    private readonly clientId: string;

    private _kafkaProducer!: ProducerStream;
    private _kafkaConsumer!: ConsumerStream;

    constructor(args: PubSubConstructorArgs, logger: iLogger) {
        if (!args.host || !args.clientId) throw "bad_implementation";
        this._logger = logger;
        this.clientId = args.clientId;
        this.initProducer(args.host);
        this.initConsumer(args.host, args.topics || []);
        this.setEventListeners(args.dispath);
    }

    async publish<T>(args: iPayloadEvent<T>): Promise<void> {
        const data: iPayloadEvent<unknown> = {
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
                    tag: this.TAG + "" + this.clientId,
                    msg: error.message,
                });
            } else {
                this._logger.log({
                    type: "DEBUG",
                    tag: this.TAG + this.clientId,
                    msg: "Payload send succesfuly: " + JSON.stringify(args.data)
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
                "group.id": "kafka",
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
            const { to, event, data } = <iPayloadEvent<unknown>>JSON.parse(strPayload);
            if (to === this.clientId) {
                this._logger.log({
                    type: "DEBUG",
                    tag: this.TAG,
                    msg:
                        `topic: ${topic} timestamp: ${new Date(timestamp).toISOString()}` +
                        "\n" + strPayload,
                });
                dispatch({
                    event, data: {
                        context: {
                            logger: this._logger.log,
                            publish: this.publish,
                        }, payload: data
                    }
                });
            }
        });
    }

}