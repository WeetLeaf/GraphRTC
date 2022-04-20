"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builder_1 = require("../builder");
builder_1.builder.queryField("isAlive", (t) => t.boolean({ resolve: () => true }));
builder_1.builder.queryField("ping", (t) => t.string({ resolve: () => "pong" }));
builder_1.builder.subscriptionField("serverStatus", (t) => t.float({
    deprecationReason: "Use only for testing",
    description: "Subscription to server status, trigger using mutation `testSubscription` ",
    subscribe: (_, _args, { pubsub }) => {
        console.log("subscribe");
        return pubsub.asyncIterator("TEST_SUB");
    },
    resolve: (payload) => {
        console.log("payload", payload);
        return payload;
    },
}));
builder_1.builder.mutationField("testSubscription", (t) => t.boolean({
    deprecationReason: "Use only for testing",
    description: "Mutation to trigger subscription serverStatus !",
    resolve: async (_, _args, { pubsub }) => {
        console.log("pub sub");
        await pubsub.publish("TEST_SUB", Math.random());
        return true;
    },
}));
