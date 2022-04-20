import { configGraphQLServer as graphQLServer } from "./graphql/server";
import express from "express";
import { createServer } from "http";
import next from "next";

const PORT = process.env.PORT || 8080;

const dev = process.env.NODE_ENV !== "production";
console.log("Starting server in " + (dev ? "dev" : "prod") + " mode");

const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

async function startApolloServer() {
  await nextApp.prepare();
  const app = express();

  const httpServer = createServer(app);

  const server = await graphQLServer(httpServer, app);

  app.all("*", (req, res) => {
    return handle(req, res);
  });

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT }, resolve)
  );

  console.info(`🚀 GraphQL at https://localhost:${PORT}${server.graphqlPath}`);
}

startApolloServer();
