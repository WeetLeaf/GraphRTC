import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import { Application } from "express";
import { execute, subscribe } from "graphql";
import { graphqlUploadExpress } from "graphql-upload";
import { useServer } from "graphql-ws/lib/use/ws";
import { Server } from "http";
import { WebSocketServer } from "ws";
import { CustomPubSub } from "../utils/pubsub.utils";
import { schema } from "./schema";
import { HandlerContext, HttpContext, SubscriptionsContext } from "./types";

const pubsub = new CustomPubSub();

export async function configGraphQLServer(
  httpServer: Server,
  app: Application
) {
  app.use(graphqlUploadExpress());

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/api/graphql",
  });

  const serverCleanup = useServer(
    {
      schema,
      execute,
      subscribe,
      context: (): SubscriptionsContext => {
        return {
          pubsub,
        };
      },
    },
    wsServer
  );

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageGraphQLPlayground({
        faviconUrl: "/favicon.ico",
        title: "API Playground",
        settings: { "request.credentials": "include" },
      }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              serverCleanup.dispose();
            },
          };
        },
      },
    ],
    context: ({
      req,
      res,
    }: HandlerContext): Omit<HttpContext, "dataSources"> => {
      return { req, res, pubsub };
    },
  });
  await server.start();

  server.applyMiddleware({
    app,
    path: "/api/graphql",
    cors: {
      credentials: true,
      origin: true,
    },
  });
  return server;
}
