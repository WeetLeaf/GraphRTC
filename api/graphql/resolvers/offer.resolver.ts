import { builder } from "../builder";
import type { Offer } from "../models/Offer";

export const OfferObject = builder.objectRef<Offer>("Offer");

export const RTCSdpTypeEnum = builder.enumType("RTCSdpType", {
  values: {
    offer: { value: "offer" },
    pranswer: { value: "pranswer" },
    answer: { value: "answer" },
    rollback: { value: "rollback" },
  } as const,
});

export const OfferInput = builder.inputType("OfferInput", {
  fields: (t) => ({
    type: t.field({ type: RTCSdpTypeEnum }),
    sdp: t.string({ required: false }),
  }),
});

builder.objectType(OfferObject, {
  fields: (t) => ({
    type: t.expose("type", { type: RTCSdpTypeEnum }),
    sdp: t.exposeString("sdp", { nullable: true }),
  }),
});
