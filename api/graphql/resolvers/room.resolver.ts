import { builder } from "../builder";
import { ParticiantAction, Participant } from "../models/Participants";
import { Room } from "../models/Room";
import { RoomAction } from "../models/RoomAction";
import {
  ParticiantActionObject,
  ParticipantObject,
} from "./participant.resolver";

export const RoomObject = builder.objectType(Room, {
  name: "Room",
  fields: (t) => ({
    uuid: t.exposeString("uuid"),
    participants: t.expose("participants", {
      type: [ParticipantObject],
    }),
  }),
});

builder.mutationField("createRoom", (t) =>
  t.field({
    type: RoomObject,
    args: {},
    resolve: async (_root, _args, { rooms }) => {
      const room = new Room();
      rooms.set(room.uuid, room);
      return room;
    },
  })
);

builder.queryField("room", (t) =>
  t.field({
    type: RoomObject,
    nullable: true,
    args: {
      uuid: t.arg.string({ required: true }),
    },
    resolve: (_root, { uuid }, { rooms }) => {
      return rooms.get(uuid);
    },
  })
);

builder.queryField("joinRoom", (t) =>
  t.field({
    type: RoomObject,
    nullable: true,
    args: {
      uuid: t.arg.string({ required: true }),
      name: t.arg.string({ required: true }),
    },
    resolve: async (_root, { uuid, name }, { rooms, pubsub }) => {
      const room = rooms.get(uuid);
      if (!room) return null;
      const participant = new Participant(name);
      room.participants.push(participant);
      await pubsub.publish<ParticiantAction>(`${uuid}_NEW_PARTICIPANT`, {
        participant,
        action: RoomAction.JOIN,
      });
      return room;
    },
  })
);

builder.subscriptionField("subscribeToParticipants", (t) =>
  t.field({
    type: ParticiantActionObject,
    args: {
      uuid: t.arg.string({ required: true, description: "Room uuid" }),
    },
    subscribe: (_, { uuid }, { pubsub }) => {
      return pubsub.asyncIterator<ParticiantAction>(`${uuid}_PARTICIPANT`);
    },
    resolve: (payload: ParticiantAction) => {
      return payload;
    },
  })
);

builder.mutationField("leaveRoom", (t) =>
  t.field({
    type: RoomObject,
    nullable: true,
    args: {
      uuid: t.arg.string({ required: true }),
      name: t.arg.string({ required: true }),
    },
    resolve: async (_root, { uuid, name }, { rooms, pubsub }) => {
      const room = rooms.get(uuid);
      if (!room) return null;

      const participant = new Participant(name);
      room.participants.push(participant);
      await pubsub.publish<ParticiantAction>(`${uuid}_PARTICIPANT`, {
        participant,
        action: RoomAction.LEAVE,
      });
      return room;
    },
  })
);
