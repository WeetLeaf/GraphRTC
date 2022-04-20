"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configGraphQLServer = void 0;
const apollo_server_core_1 = require("apollo-server-core");
const apollo_server_express_1 = require("apollo-server-express");
const graphql_1 = require("graphql");
const graphql_upload_1 = require("graphql-upload");
const ws_1 = require("graphql-ws/lib/use/ws");
const ws_2 = require("ws");
const pubsub_utils_1 = require("../utils/pubsub.utils");
const schema_1 = require("./schema");
const pubsub = new pubsub_utils_1.CustomPubSub();
async function configGraphQLServer(httpServer, app) {
    app.use((0, graphql_upload_1.graphqlUploadExpress)());
    const wsServer = new ws_2.WebSocketServer({
        server: httpServer,
        path: "/api/graphql",
    });
    const serverCleanup = (0, ws_1.useServer)({
        schema: schema_1.schema,
        execute: graphql_1.execute,
        subscribe: graphql_1.subscribe,
        context: () => {
            return {
                pubsub,
            };
        },
    }, wsServer);
    const server = new apollo_server_express_1.ApolloServer({
        schema: schema_1.schema,
        plugins: [
            (0, apollo_server_core_1.ApolloServerPluginDrainHttpServer)({ httpServer }),
            (0, apollo_server_core_1.ApolloServerPluginLandingPageGraphQLPlayground)({
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
        context: ({ req, res, }) => {
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
exports.configGraphQLServer = configGraphQLServer;
