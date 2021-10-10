import { makeExecutableSchema } from "@graphql-tools/schema";
import {
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageLocalDefault,
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
import {
  iServerContext,
  iServerSettings,
} from "../interfaces/server.interface";
import { iProcessHandler } from "./../interfaces/processHandler.interface";
import app from "./app";
import { resolvers } from "./resolvers";
import { typeDefs } from "./typeDefs";

export class GraphQLApp implements iApplication {
  private _app = app;
  private _env: Environment;
  private _logger?: iLogger;
  private _processHandler: iProcessHandler;
  private _pubSub: iPubSub;

  constructor(args: iApplicationParams) {
    this._env = args.environment || "production";
    this._logger = args.logger;
    this._processHandler = args.processHandler;
    this._pubSub = args.pubSub;
    this._app.set("environment", args.environment);
    this._app.set("logger", args.logger);
    this._app.set("processHandler", args.processHandler);
    this._app.set("pubSub", args.pubSub);
  }

  async start(args: iServerSettings): Promise<void> {
    try {
      await this._processHandler?.init();

      const httpServer = createServer(this._app);
      const schema = makeExecutableSchema({ typeDefs, resolvers });

      const apolloServer = new ApolloServer({
        schema: schema,
        context: this.context,
        debug: true,
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
          onConnect: this.context,
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
          tag: `***-> Server settings (${args.env}):\n`,
          msg:
            `🚀 Server ready at http://localhost:${args.port}${apolloServer.graphqlPath}` +
            "\n" +
            `🚀 Server ready at ws://localhost:${args.port}${apolloServer.graphqlPath}` +
            "\n" +
            `🚀 Public dir at http://localhost:${args.port}/public`,
        });
      });
    } catch (error) {
      this._logger?.log({
        type: "ERROR",
        tag: `***-> Error server start:`,
        msg: (error as Error).toString(),
      });
    }
  }

  async context(args: iServerContext): Promise<iApplicationContext> {
    return {
      token: args.req.headers.authorization,
      logger: args.req.app.get("logger"),
      processHandler: args.req.app.get("processHandler"),
      environment: args.req.app.get("environment"),
      pubSub: args.req.app.get("pubSub"),
    };
  }
}
