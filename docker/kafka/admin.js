const { AdminClient } = require("node-rdkafka");
require("dotenv").config()
const {EXTERNAL_PUBSUB_SERVER='0.0.0.0:9093'} = process.env;
console.log(EXTERNAL_PUBSUB_SERVER);
const topicName = "venttys_graphql_api";
const topic = {
  topic: topicName,
  num_partitions: 1,
  replication_factor: 1,
};

const admin = AdminClient.create({
  "client.id": "admin",
  "metadata.broker.list": EXTERNAL_PUBSUB_SERVER,
});

admin.createTopic(topic, (error) => {
  if (error) {
    if (error.code === 36) {
      console.log("***-> The topic was previous created");
    } else {
      console.log("***-> ", error);
    }
  } else {
    console.log("***-> Topic created");
  }
});
