import { builder } from "../builder";
import { ParticiantOffer, Participant } from "../models/Participants";
import { OfferObject } from "./offer.resolver";

export const ParticipantObject = builder.objectType(Participant, {
  name: "Participant",
  fields: (t) => ({
    uuid: t.exposeString("uuid"),
  }),
});

export const ParticiantActionObject = builder.objectType(ParticiantOffer, {
  name: "ParticiantAction",
  fields: (t) => ({
    participant: t.expose("participant", {
      type: ParticipantObject,
    }),
    action: t.expose("offer", { type: OfferObject }),
  }),
});
