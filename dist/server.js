"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./graphql/server");
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const next_1 = __importDefault(require("next"));
const PORT = process.env.PORT || 8080;
const dev = process.env.NODE_ENV !== "production";
console.log("Starting server in " + (dev ? "dev" : "prod") + " mode");
const nextApp = (0, next_1.default)({ dev });
const handle = nextApp.getRequestHandler();
async function startApolloServer() {
    await nextApp.prepare();
    const app = (0, express_1.default)();
    const httpServer = (0, http_1.createServer)(app);
    const server = await (0, server_1.configGraphQLServer)(httpServer, app);
    app.all("*", (req, res) => {
        return handle(req, res);
    });
    await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
    console.info(`🚀 GraphQL at https://localhost:${PORT}${server.graphqlPath}`);
}
startApolloServer();
