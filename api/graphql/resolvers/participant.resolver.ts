import { builder } from "../builder";
import { ParticiantAction, Participant } from "../models/Participants";
import { RoomAction } from "../models/RoomAction";

export const ParticipantObject = builder.objectType(Participant, {
  name: "Participant",
  fields: (t) => ({
    uuid: t.exposeString("uuid"),
    name: t.exposeString("name"),
  }),
});

export const ParticiantActionObject = builder.objectType(ParticiantAction, {
  name: "ParticiantAction",
  fields: (t) => ({
    participant: t.expose("participant", {
      type: ParticipantObject,
    }),
    action: t.expose("action", { type: RoomAction }),
  }),
});
