import { builder } from "../builder";

export interface IChatMessage {
  roomUuid: string;
  message: string;
  sender: string;
}

export const ChatMessage = builder.objectRef<IChatMessage>("ChatMessage");

builder.objectType(ChatMessage, {
  fields: (t) => ({
    roomUuid: t.exposeString("roomUuid"),
    message: t.exposeString("message"),
    sender: t.exposeString("sender"),
  }),
});

builder.subscriptionField("subscribeToMessages", (t) =>
  t.field({
    type: ChatMessage,
    args: {
      roomUuid: t.arg.string(),
    },
    subscribe: (_, { roomUuid }, { pubsub }) => {
      return pubsub.asyncIterator<IChatMessage>(`NEW_MESSAGE:${roomUuid}`);
    },
    resolve: (payload: IChatMessage) => {
      return payload;
    },
  })
);

builder.mutationField("sendMessage", (t) =>
  t.string({
    args: {
      roomUuid: t.arg.string(),
      message: t.arg.string(),
      sender: t.arg.string(),
    },
    resolve: async (_root, { roomUuid, message, sender }, { pubsub }) => {
      await pubsub.publish<IChatMessage>(`NEW_MESSAGE:${roomUuid}`, {
        message,
        roomUuid,
        sender,
      });
      return message;
    },
  })
);
