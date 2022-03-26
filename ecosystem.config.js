module.exports = {
    apps: [
        {
            name: "venttys-graphql",
            script: "npm -- start",
            env: {
                PORT:8000,
                ENV: "development",
                DB_CONNECTION_STRING: "mongodb://venttys:dmVudHR5cw@localhost:27017/venttys-bot?authSource=admin",
            },
        },
    ],
};
