import { builder } from "../builder";

builder.queryField("isAlive", (t) => t.boolean({ resolve: () => true }));

builder.queryField("ping", (t) => t.string({ resolve: () => "pong" }));

builder.subscriptionField("serverStatus", (t) =>
  t.float({
    deprecationReason: "Use only for testing",
    description:
      "Subscription to server status, trigger using mutation `testSubscription` ",

    subscribe: (_, _args, { pubsub }) => {
      return pubsub.asyncIterator("TEST_SUB");
    },
    resolve: (payload: number) => {
      return payload;
    },
  })
);

builder.mutationField("testSubscription", (t) =>
  t.boolean({
    deprecationReason: "Use only for testing",
    description: "Mutation to trigger subscription serverStatus !",
    resolve: async (_, _args, { pubsub }) => {
      await pubsub.publish("TEST_SUB", Math.random());
      return true;
    },
  })
);

builder.subscriptionField("isConnectionReady", (t) =>
  t.boolean({
    subscribe: (_, _args, { pubsub }) => {
      setTimeout(() => {
        pubsub.publish("IS_READY", true);
      }, 100);
      return pubsub.asyncIterator("IS_READY");
    },
    resolve: () => true,
  })
);
