module.exports = {
    apps: [
        {
            name: "KRUSTY",
            script: "npm -- start",
            env: {
                NODE_ENV: "development",
                PHONE: "+573117922157",
                COMMERCE: "HAMBURGUESAS KRUSTY",
                EXTERNAL_PUBSUB_SERVER: "localhost:9093",
                DB_CONNECTION_STRING: "mongodb://venttys:dmVudHR5cw@localhost:27017/venttys-bot?authSource=admin",
            },
        },
    ],
};
