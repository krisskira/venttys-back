var { Producer, KafkaConsumer } = require("node-rdkafka");
require("dotenv").config();

const { EXTERNAL_PUBSUB_SERVER = "localhost:9093" } = process.env;

const topic = "venttys_graphql_api";
const publishSecondsTime = 20;

const kafkaProducer = Producer.createWriteStream(
  {
    "client.id": "demo:producer" + process.argv[2],
    "metadata.broker.list": EXTERNAL_PUBSUB_SERVER,
  },
  {},
  { topic }
);

const stream = KafkaConsumer.createReadStream(
  {
    "group.id": "kafka" + process.argv[2],
    "client.id": "demo:consumer" + process.argv[2],
    "metadata.broker.list": EXTERNAL_PUBSUB_SERVER,
    "allow.auto.create.topics":true,
    "enable.auto.commit":false,
  },
  {"enable.auto.commit":false},
  { topics:[topic], autoClose: false }
).on("data", ({ topic, timestamp, value, ...rest }) => {
  console.log("\n***-> REST: ", JSON.parse(value.toString()), rest, "\n");
});

setInterval(() => {
  console.log('***-> Enviando...', { topics:[topic] })
  kafkaProducer.write(Buffer.from(JSON.stringify({ ping: "pong" + process.argv[2] })));
}, publishSecondsTime * 1000);
