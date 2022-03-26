module.exports = {
    apps: [
        {
            name: "venttys-graphql",
            script: "npm -- start",
            env: {
                ENV: "development",
		PORT:8000,
                EXTERNAL_PUBSUB_SERVER: "localhost:9093",
                DB_CONNECTION_STRING: "mongodb://venttys:dmVudHR5cw@localhost:27017/venttys-bot?authSource=admin",
            },
        },
    ],
};
