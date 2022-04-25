import { RtcSdpType } from "../__generated__/grahql";

export const mapTypeOffer = (type: RTCSdpType): RtcSdpType => {
  switch (type) {
    case "offer":
      return RtcSdpType.Offer;
    case "answer":
      return RtcSdpType.Answer;
    case "pranswer":
      return RtcSdpType.Pranswer;
    case "rollback":
      return RtcSdpType.Rollback;
    default:
      throw new Error("What are you doing ????");
  }
};
