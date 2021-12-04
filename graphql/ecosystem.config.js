module.exports = {
    apps: [
        {
            name: "venttys-graphql",
            script: "npm -- start",
            env: {
                NODE_ENV: "production",
                EXTERNAL_PUBSUB_SERVER: "localhost:9093",
                DB_CONNECTION_STRING: "mongodb://venttys:dmVudHR5cw@localhost:27017/venttys-bot?authSource=admin",
            },
        },
    ],
};
