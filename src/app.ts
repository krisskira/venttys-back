import { GraphQLApp } from "./infrastructure/graphql-server";
import { Environment } from "./infrastructure/interfaces/application.interface";
// import { ConsoleLogger } from "./infrastructure/logger/console.logger";
// import { PM2ProcessHandler } from "./infrastructure/process-handler";
import { WistonLogger } from "./infrastructure/logger/wiston.logger";
import { DockerProcessHandler } from "./infrastructure/process-handler";
import { PubSubHandler } from "./infrastructure/pub-sub";

export default async function bootstrap(): Promise<void> {
  const {
    ENV: _environment = "production",
    PORT: _port = "3000",
    EXTERNAL_PUBSUB_SERVER = "venttys-kafka:9092",
  } = process.env;

  const port = parseInt(_port, 10);
  const environment = <Environment>_environment;

  const logger = new WistonLogger(environment);
  const processHandler = new DockerProcessHandler(
    logger,
    environment,
    EXTERNAL_PUBSUB_SERVER
  );
  // const logger = new ConsoleLogger(environment);
  // const processHandler = new PM2ProcessHandler(logger);

  const pubSub = new PubSubHandler(logger);

  const app = new GraphQLApp({
    environment: environment,
    logger,
    pubSub,
    processHandler,
  });

  await app.start({ port, env: environment });
}
