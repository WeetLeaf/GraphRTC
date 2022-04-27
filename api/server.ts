import { configGraphQLServer as graphQLServer } from "./graphql/server";
import express from "express";
import { createServer } from "http";
import next from "next";

const PORT = process.env.PORT || 3001;

const isProd = process.env.NODE_ENV === "production";
console.info("Starting server in " + (!isProd ? "dev" : "prod") + " mode");

async function startApolloServer() {
  const app = express();

  const httpServer = createServer(app);

  const server = await graphQLServer(httpServer, app);

  // Fix for the socket having a conflict with HMR from Next.js
  // In dev mode we launch 2 apps, one for the server and one for the client
  // In prod mode we launch only one app because there is no HMR
  if (isProd) {
    const nextApp = next({ dev: false });
    const handle = nextApp.getRequestHandler();
    await nextApp.prepare();

    // Redirect to https in Prod
    app.use((req, res, next) => {
      if (!req.secure) {
        res.redirect(301, "https://" + req.headers.host + req.url);
      } else {
        next();
      }
    });

    app.all("*", (req, res) => {
      return handle(req, res);
    });
  }

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT }, resolve)
  );

  console.info(`🚀 GraphQL at https://localhost:${PORT}${server.graphqlPath}`);
}

startApolloServer();
