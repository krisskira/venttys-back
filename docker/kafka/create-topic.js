const { AdminClient } = require("node-rdkafka");
require("dotenv").config();
const { EXTERNAL_PUBSUB_SERVER = "localhost:9093" } = process.env;

const topicName = "venttys_graphql_api";
const topic = {
  topic: topicName,
  num_partitions: 1,
  replication_factor: 1,
};

const admin = AdminClient.create({
  "client.id": "admin:create-topic",
  "metadata.broker.list": EXTERNAL_PUBSUB_SERVER,
});

admin.createTopic(topic, (error) => {
  if (error) {
    if (error.code === 36) {
      console.log("***-> The topic was previous created");
      process.exit(0);
    } else {
      console.log("***-> ", error);
      process.exit(1);
    }
  } else {
    console.log("***-> Topic created");
    process.exit(0);
  }
});
