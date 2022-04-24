import { builder } from "../builder";
import { Candidate, CandidateType } from "../models/Candidate";
import { Offer } from "../models/Offer";
import { Participant } from "../models/Participants";
import { Room } from "../models/Room";
import { CandidateInput, CandidateObject } from "./candidate.resolver";
import { OfferInput, OfferObject } from "./offer.resolver";

export const RoomObject = builder.objectType(Room, {
  name: "Room",
  fields: (t) => ({
    uuid: t.exposeString("uuid"),
  }),
});

builder.mutationField("createRoom", (t) =>
  t.field({
    type: RoomObject,
    args: {
      name: t.arg.string(),
    },
    resolve: () => {
      return new Room();
    },
  })
);

// Just send the event to the room that you are joining
builder.queryField("joinRoom", (t) =>
  t.boolean({
    nullable: true,
    args: {
      roomUuid: t.arg.string(),
      userUuid: t.arg.string(),
    },
    resolve: async (_root, { roomUuid, userUuid }, { pubsub }) => {
      await pubsub.publish<Participant>(`${roomUuid}:NEW_PARTICIPANT`, {
        uuid: userUuid,
      });
      return true;
    },
  })
);

// Subscribe to new participants in the room
// The particiapant is sending his own uuid generated in the client
// The server send the participant uuid to the room
builder.subscriptionField("subscribeToParticipants", (t) =>
  t.field({
    type: Participant,
    args: {
      roomUuid: t.arg.string(),
    },
    subscribe: (_root, { roomUuid }, { pubsub }) => {
      return pubsub.asyncIterator<Participant>(`${roomUuid}:NEW_PARTICIPANT`);
    },
    resolve: (payload: Participant) => {
      return payload;
    },
  })
);

// The user send the offer to the room with the particiapant uuid
builder.mutationField("sendUserOffer", (t) =>
  t.boolean({
    args: {
      roomUuid: t.arg.string(),
      userUuid: t.arg.string(),
      offer: t.arg({ type: OfferInput }),
    },
    resolve: async (_root, { roomUuid, userUuid, offer }, { pubsub }) => {
      await pubsub.publish<Offer>(`${roomUuid}:${userUuid}:NEW_OFFER`, {
        type: offer.type,
        sdp: offer.sdp ?? undefined,
      });
      return true;
    },
  })
);

// The user subscribe to the offer he gets on his own user uuid to a specific room
builder.subscriptionField("subscribeToOffers", (t) =>
  t.field({
    type: OfferObject,
    args: {
      userUuid: t.arg.string({ description: "User uuid" }),
      roomUuid: t.arg.string({ description: "Room uuid" }),
    },
    subscribe: (_, { roomUuid, userUuid }, { pubsub }) => {
      return pubsub.asyncIterator<Offer>(`${roomUuid}:${userUuid}:NEW_OFFER`);
    },
    resolve: (payload: Offer) => {
      return payload;
    },
  })
);

builder.mutationField("sendOfferAnswer", (t) =>
  t.boolean({
    args: {
      roomUuid: t.arg.string(),
      offerSdp: t.arg.string(),
      answer: t.arg({ type: OfferInput }),
    },
    resolve: async (_root, { roomUuid, offerSdp, answer }, { pubsub }) => {
      await pubsub.publish<Offer>(`${roomUuid}:${offerSdp}:NEW_ANSWER`, {
        type: answer.type,
        sdp: answer.sdp ?? undefined,
      });
      return true;
    },
  })
);

builder.subscriptionField("subscribeToAnswers", (t) =>
  t.field({
    type: OfferObject,
    args: {
      roomUuid: t.arg.string({ description: "Room uuid" }),
      offerSdp: t.arg.string({ description: "Offer sdp" }),
    },
    subscribe: (_, { roomUuid, offerSdp }, { pubsub }) => {
      return pubsub.asyncIterator<Offer>(`${roomUuid}:${offerSdp}:NEW_ANSWER`);
    },
    resolve: (payload: Offer) => {
      return payload;
    },
  })
);

builder.mutationField("addIceCandidate", (t) =>
  t.boolean({
    args: {
      roomUuid: t.arg.string(),
      offerSdp: t.arg.string(),
      iceCandidate: t.arg({
        type: CandidateInput,
      }),
      candidateType: t.arg({
        type: CandidateType,
      }),
    },
    resolve: async (
      _root,
      { roomUuid, offerSdp, iceCandidate, candidateType },
      { pubsub }
    ) => {
      await pubsub.publish<Candidate>(
        `${roomUuid}:${offerSdp}:${candidateType}`,
        {
          candidate: iceCandidate.candidate ?? undefined,
          sdpMLineIndex: iceCandidate.sdpMLineIndex ?? undefined,
          sdpMid: iceCandidate.sdpMid ?? undefined,
          usernameFragment: iceCandidate.usernameFragment ?? undefined,
        }
      );
      return true;
    },
  })
);

builder.subscriptionField("subscribeToCandidate", (t) =>
  t.field({
    type: CandidateObject,
    args: {
      roomUuid: t.arg.string(),
      offerSdp: t.arg.string(),
      candidateType: t.arg({
        type: CandidateType,
      }),
    },
    subscribe: (_, { roomUuid, offerSdp, candidateType }, { pubsub }) => {
      return pubsub.asyncIterator<Candidate>(
        `${roomUuid}:${offerSdp}:${candidateType}`
      );
    },
    resolve: (payload: Candidate) => {
      return payload;
    },
  })
);
