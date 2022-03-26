import { makeExecutableSchema } from "@graphql-tools/schema";
import {
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import { execute, subscribe } from "graphql";
import { createServer } from "http";
import { SubscriptionServer } from "subscriptions-transport-ws";

import {
  Environment,
  iApplication,
  iApplicationContext,
  iApplicationParams,
} from "../interfaces/application.interface";
import { iLogger } from "../interfaces/logger.interface";
import { iPubSub } from "../interfaces/pubSub.interface";
import { iServerSettings } from "../interfaces/server.interface";
import { iProcessHandler } from "./../interfaces/processHandler.interface";
import app from "./app";
import { resolvers } from "./resolvers";
import { typeDefs } from "./typeDefs";

export class GraphQLApp implements iApplication {
  private readonly TAG = "GraphQLApp";
  private _app = app;
  private _env: Environment;
  private _logger: iLogger;
  private _processHandler: iProcessHandler;
  private _pubSub: iPubSub;

  constructor(args: iApplicationParams) {
    this._env = args.environment || "production";
    this._logger = args.logger;
    this._processHandler = args.processHandler;
    this._pubSub = args.pubSub;

    this._app.set("environment", this._env);
    this._app.set("logger", this._logger);
    this._app.set("processHandler", this._processHandler);
    this._app.set("pubSub", this._pubSub);
  }

  async start(args: iServerSettings): Promise<void> {
    try {
      const processHandlerInitResult = await this._processHandler.init();
      if (processHandlerInitResult) {
        this._logger.log({
          tag: this.TAG,
          msg: processHandlerInitResult.join("\n"),
          type: "INFO",
        });
      }

      const httpServer = createServer(this._app);
      const schema = makeExecutableSchema({ typeDefs, resolvers });

      const apolloServer = new ApolloServer({
        schema: schema,
        context: ({ req }) => this.context(req.headers),
        debug: args.env !== "production",
        plugins: [
          args.env === "production"
            ? ApolloServerPluginLandingPageDisabled()
            : ApolloServerPluginLandingPageGraphQLPlayground(),
        ],
      });
      await apolloServer.start();
      apolloServer.applyMiddleware({ app: this._app });

      const subscServer = new SubscriptionServer(
        {
          schema: schema,
          execute,
          subscribe,
          onConnect: (headers: Record<string, unknown>) =>
            this.context(headers),
        },
        {
          server: httpServer,
          path: apolloServer.graphqlPath,
        }
      );

      ["SIGINT", "SIGTERM"].forEach((signal) => {
        process.on(signal, () => {
          subscServer.close();
          process.exit(0);
        });
      });

      httpServer.listen(args.port, () => {
        this._logger?.log({
          type: "DEBUG",
          tag: `\n***-> Server (${args.env})`,
          msg:
            "\n" +
            `\t🚀 Server ready at http://localhost:${args.port}${apolloServer.graphqlPath} \n` +
            `\t🚀 Server ready at ws://localhost:${args.port}${apolloServer.graphqlPath} \n` +
            `\t🚀 Public dir at http://localhost:${args.port}/public \n`,
        });
      });
    } catch (error) {
      this._logger?.log({
        tag: this.TAG,
        type: "ERROR",
        msg: (error as Error).toString(),
      });
    }
  }

  async context(
    headers: Record<string, unknown>
  ): Promise<iApplicationContext> {
    const { authorization = undefined } = headers;
    return {
      headers,
      token: authorization,
      pubSub: this._pubSub,
      logger: this._logger,
      processHandler: this._processHandler,
      environment: this._env,
    };
  }
}
