import { builder } from "../builder";
import { Candidate, CandidateType } from "../models/Candidate";

export const CandidateObject = builder.objectRef<Candidate>("Candidate");

builder.enumType(CandidateType, { name: "CandidateType" });

builder.objectType(CandidateObject, {
  fields: (t) => ({
    candidate: t.exposeString("candidate", { nullable: true }),
    sdpMid: t.exposeString("sdpMid", { nullable: true }),
    sdpMLineIndex: t.exposeInt("sdpMLineIndex", { nullable: true }),
    usernameFragment: t.exposeString("usernameFragment", { nullable: true }),
  }),
});

export const CandidateInput = builder.inputType("CandidateInput", {
  fields: (t) => ({
    candidate: t.string({ required: false }),
    sdpMid: t.string({ required: false }),
    sdpMLineIndex: t.int({ required: false }),
    usernameFragment: t.string({ required: false }),
  }),
});
